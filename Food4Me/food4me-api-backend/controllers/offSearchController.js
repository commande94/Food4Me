const alimentsCiqual = require('../config/ciqual');

// ─── Rate-limit queue ──────────────────────────────────────────────────────────
class RequestQueue {
    constructor(minInterval = 300) {
        this.minInterval = minInterval;
        this.lastRequestTime = 0;
        this.queue = [];
        this.processing = false;
    }

    async add(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const now = Date.now();
            const elapsed = now - this.lastRequestTime;

            if (elapsed < this.minInterval) {
                await new Promise(r => setTimeout(r, this.minInterval - elapsed));
            }

            const { fn, resolve, reject } = this.queue.shift();
            try {
                this.lastRequestTime = Date.now();
                const result = await fn();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }
        this.processing = false;
    }
}

const requestQueue = new RequestQueue(300);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function normalizeString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function transformCiqualToProduct(item) {
    return {
        code: `ciqual_${item.nom.replace(/\s+/g, '_')}`,
        product_name: item.nom,
        brands: "Aliment générique (Ciqual)",
        image_front_url: null,
        nutriments: {
            "energy-kcal_100g": item.calories,
            proteins_100g: item.proteines,
            carbohydrates_100g: item.glucides,
            fat_100g: item.lipides,
        }
    };
}

// ─── Requête OFF avec retry automatique ───────────────────────────────────────
// Réessaie une fois si : timeout, 429 (rate-limit) ou erreur réseau passagère.
// maxAttempts = 2 → 1 essai + 1 retry.
async function fetchFromOFF(terme, maxAttempts = 2) {
    const TIMEOUT_MS = 8000;  // OFF peut être lent, 8s est raisonnable
    const RETRY_DELAY = 1200;  // attendre 1,2s avant de réessayer
    const fields = 'code,product_name,brands,image_front_url,nutriments,unique_scans_n';
    const url = `https://world.openfoodfacts.org/cgi/search.pl`
        + `?search_terms=${encodeURIComponent(terme)}`
        + `&search_simple=1&action=process&json=1`
        + `&page_size=20`          // réduit vs 30 → réponse plus légère
        + `&sort_by=unique_scans_n`
        + `&lc=fr`                 // préférence pour les produits francophones
        + `&fields=${fields}`;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Food4Me/1.0 (dev@food4me.com)' },
                signal: controller.signal,
            });
            clearTimeout(timer);

            // ── 429 : réessai après délai
            if (response.status === 429) {
                if (attempt < maxAttempts) {
                    console.warn(`⚠️  OFF 429 – retry dans ${RETRY_DELAY}ms (tentative ${attempt}/${maxAttempts})`);
                    await new Promise(r => setTimeout(r, RETRY_DELAY));
                    continue;
                }
                throw new Error('RATE_LIMIT');
            }

            if (!response.ok) throw new Error(`OFF_HTTP_${response.status}`);

            return await response.json();

        } catch (err) {
            clearTimeout(timer);

            const isTimeout = err.name === 'AbortError';
            const isNetwork = err.message?.startsWith('fetch failed') || err.code === 'ECONNRESET';

            // Réessai sur timeout ou erreur réseau transitoire
            if ((isTimeout || isNetwork) && attempt < maxAttempts) {
                console.warn(`⚠️  OFF ${isTimeout ? 'timeout' : 'erreur réseau'} – retry dans ${RETRY_DELAY}ms (tentative ${attempt}/${maxAttempts})`);
                await new Promise(r => setTimeout(r, RETRY_DELAY));
                continue;
            }

            throw err; // relancer après tous les essais épuisés
        }
    }
}

// ─── Contrôleur principal ──────────────────────────────────────────────────────
exports.search = async (req, res) => {
    try {
        const { terme } = req.query;
        if (!terme || terme.trim().length < 2) {
            return res.status(400).json({ error: "Terme de recherche trop court (min 2 caractères)." });
        }

        const termeNormalize = normalizeString(terme.trim());

        // ── 1. Base locale Ciqual (instantané, prioritaire) ──────────────────
        const resultatsLocaux = alimentsCiqual
            .filter(a => normalizeString(a.nom).includes(termeNormalize))
            .sort((a, b) => {
                const nomA = normalizeString(a.nom);
                const nomB = normalizeString(b.nom);
                const startA = nomA.startsWith(termeNormalize);
                const startB = nomB.startsWith(termeNormalize);
                if (startA && !startB) return -1;
                if (!startA && startB) return 1;
                return nomA.length - nomB.length;
            })
            .slice(0, 20);

        if (resultatsLocaux.length > 0) {
            return res.json({
                products: resultatsLocaux.map(transformCiqualToProduct),
                source: "ciqual",
            });
        }

        // ── 2. Open Food Facts (via queue + retry) ────────────────────────────
        const result = await requestQueue.add(() => fetchFromOFF(terme.trim()));

        let products = (result.products || [])
            .filter(p => p.product_name && normalizeString(p.product_name).includes(termeNormalize))
            .sort((a, b) => (b.unique_scans_n || 0) - (a.unique_scans_n || 0))
            .slice(0, 15);

        // Fallback : si le filtre strict ne retourne rien, on prend les 10 premiers bruts
        if (products.length === 0) {
            products = (result.products || []).slice(0, 10);
        }

        res.set('Cache-Control', 'public, max-age=300');
        return res.json({ products, source: "openfoodfacts" });

    } catch (error) {
        console.error('❌ Erreur recherche OFF:', error.message);

        // On renvoie TOUJOURS un 200 avec un tableau vide côté app
        // → pas de crash, juste un message lisible pour l'utilisateur
        if (error.name === 'AbortError') {
            return res.status(200).json({
                products: [],
                source: "timeout",
                message: "L'API Open Food Facts est trop lente, réessayez dans un instant.",
            });
        }
        if (error.message === 'RATE_LIMIT') {
            return res.status(200).json({
                products: [],
                source: "rate_limit",
                message: "Trop de requêtes en cours. Patientez quelques secondes.",
            });
        }
        // Toute autre erreur (réseau, JSON malformé…)
        return res.status(200).json({
            products: [],
            source: "error",
            message: "Impossible de contacter Open Food Facts. Réessayez.",
        });
    }
};