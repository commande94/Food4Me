const alimentsCiqual = require('../config/ciqual');

// ─── Cache simple en mémoire ───────────────────────────────────────────────────
class SearchCache {
    constructor(ttlSeconds = 600) {
        this.cache = new Map();
        this.emptySearchCache = new Map();  // ✅ Mémoriser les recherches vides
        this.ttlSeconds = ttlSeconds;
        this.emptyTtlSeconds = ttlSeconds * 2;  // Les résultats vides durent 2x plus longtemps
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const isExpired = Date.now() - item.timestamp > this.ttlSeconds * 1000;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }

    set(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    // ✅ Vérifier si on a déjà essayé cette recherche sur OFF avec 0 résultats
    isEmptySearchCached(key) {
        const item = this.emptySearchCache.get(key);
        if (!item) return false;

        const isExpired = Date.now() - item.timestamp > this.emptyTtlSeconds * 1000;
        if (isExpired) {
            this.emptySearchCache.delete(key);
            return false;
        }
        return true;
    }

    // ✅ Marquer une recherche comme "vide" pour éviter de la refaire
    markAsEmpty(key) {
        this.emptySearchCache.set(key, { timestamp: Date.now() });
        console.log(`💾 Mémorisation: "${key}" retourné 0 résultat ON OFF (${this.emptyTtlSeconds}s)`);
    }

    clear() {
        this.cache.clear();
        this.emptySearchCache.clear();
    }
}

const searchCache = new SearchCache(600); // 10 minutes de cache

// ─── Rate-limit queue avec backoff progressif ──────────────────────────────────
class RateLimitedQueue {
    constructor(initialInterval = 300) {
        this.minInterval = initialInterval;
        this.baseInterval = initialInterval;
        this.lastRequestTime = 0;
        this.queue = [];
        this.processing = false;
        this.consecutiveErrors = 0;
        this.isInCooldown = false;
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

            // Augmente le délai en cas d'erreurs consécutives (backoff exponentiel)
            const backoffFactor = Math.min(Math.pow(1.5, this.consecutiveErrors), 5);
            const currentInterval = this.baseInterval * backoffFactor;

            if (elapsed < currentInterval) {
                await new Promise(r => setTimeout(r, currentInterval - elapsed));
            }

            const { fn, resolve, reject } = this.queue.shift();
            try {
                this.lastRequestTime = Date.now();
                const result = await fn();
                this.consecutiveErrors = 0; // Réinitialise après succès
                resolve(result);
            } catch (error) {
                this.consecutiveErrors++;
                console.warn(`⚠️  Erreur consécutive ${this.consecutiveErrors}, backoff appliqué`);

                if (error.message === 'RATE_LIMIT') {
                    // En cas de rate-limit, pause longue
                    this.minInterval = Math.min(this.minInterval + 2000, 10000);
                    console.warn(`⚠️  RATE LIMIT détecté → cooldown +2s (intervalle actuel: ${this.minInterval}ms)`);
                }
                reject(error);
            }
        }
        this.processing = false;
    }
}

const requestQueue = new RateLimitedQueue(300);

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

// ─── Requête OFF optimisée avec cache + retry ──────────────────────────────────
async function fetchFromOFF(terme, maxAttempts = 5) {
    const TIMEOUT_MS = 15000;  // 15s pour OFF (très généreux)
    const RETRY_DELAY = 2500;   // 2.5s entre les tentatives
    const fields = 'code,product_name,brands,image_front_url,nutriments,unique_scans_n';

    const url = `https://world.openfoodfacts.org/cgi/search.pl`
        + `?search_terms=${encodeURIComponent(terme)}`
        + `&search_simple=1&action=process&json=1`
        + `&page_size=20`          // Augmenté pour plus de résultats
        + `&sort_by=unique_scans_n`
        + `&lc=fr`                 // Préférence francophones
        + `&fields=${fields}`;

    console.log(`🔍 OFF: Recherche "${terme}" (max ${maxAttempts} tentatives)`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Food4Me/1.0 (+https://github.com/food4me)',
                    'Accept': 'application/json'
                },
                signal: controller.signal,
            });
            clearTimeout(timer);

            // Rate-limit - réessai immédiat
            if (response.status === 429) {
                if (attempt < maxAttempts) {
                    console.warn(`⚠️  OFF 429 (rate-limit) – retry ${attempt + 1}/${maxAttempts} dans ${RETRY_DELAY}ms`);
                    await new Promise(r => setTimeout(r, RETRY_DELAY));
                    continue;
                }
                throw new Error('RATE_LIMIT');
            }

            // Service indisponible temporaire
            if (response.status === 503) {
                if (attempt < maxAttempts) {
                    console.warn(`⚠️  OFF 503 (service down) – retry ${attempt + 1}/${maxAttempts} dans ${RETRY_DELAY}ms`);
                    await new Promise(r => setTimeout(r, RETRY_DELAY));
                    continue;
                }
                throw new Error('SERVICE_UNAVAILABLE');
            }

            // Autres erreurs gateway
            if (response.status === 502 || response.status === 504) {
                if (attempt < maxAttempts) {
                    console.warn(`⚠️  OFF ${response.status} (gateway error) – retry ${attempt + 1}/${maxAttempts}`);
                    await new Promise(r => setTimeout(r, RETRY_DELAY));
                    continue;
                }
            }

            if (!response.ok) {
                throw new Error(`OFF_HTTP_${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ OFF: ${data.products?.length || 0} produit(s) trouvé(s) (tentative ${attempt})`);
            return data;

        } catch (err) {
            clearTimeout(timer);

            const isTimeout = err.name === 'AbortError';
            const isNetwork = err.message?.includes('fetch failed') || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT';
            const isRecoverable = isTimeout || isNetwork || err.message === 'SERVICE_UNAVAILABLE' || err.message === 'RATE_LIMIT';

            if (isRecoverable && attempt < maxAttempts) {
                const reason = isTimeout ? 'timeout' : 'erreur réseau';
                console.warn(`⚠️  OFF ${reason} (tentative ${attempt}/${maxAttempts}) – retry dans ${RETRY_DELAY}ms`);
                await new Promise(r => setTimeout(r, RETRY_DELAY));
                continue;
            }

            console.warn(`❌ OFF échoué définitivement après ${attempt} tentative(s): ${err.message}`);
            throw err;
        }
    }
}

// ✅ Recherche alternative par MARQUE si la recherche standard ne retourne rien
async function fetchFromOFFByBrand(terme, maxAttempts = 3) {
    const TIMEOUT_MS = 12000;
    const RETRY_DELAY = 2000;
    const fields = 'code,product_name,brands,image_front_url,nutriments,unique_scans_n';

    const url = `https://world.openfoodfacts.org/cgi/search.pl`
        + `?search_terms=${encodeURIComponent(terme)}`
        + `&tagtype_0=brands`      // ✅ Recherche spécifiquement dans les marques
        + `&tag_contains_0=contains`
        + `&action=process&json=1`
        + `&page_size=20`
        + `&sort_by=unique_scans_n`
        + `&fields=${fields}`;

    console.log(`🏷️  OFF (recherche par MARQUE): "${terme}"`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Food4Me/1.0 (+https://github.com/food4me)',
                    'Accept': 'application/json'
                },
                signal: controller.signal,
            });
            clearTimeout(timer);

            if (!response.ok && response.status !== 429 && response.status !== 503) {
                throw new Error(`OFF_HTTP_${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ OFF (marque): ${data.products?.length || 0} produit(s) trouvé(s)`);
            return data;

        } catch (err) {
            clearTimeout(timer);
            if (attempt < maxAttempts) {
                console.warn(`⚠️  OFF (marque) retry ${attempt + 1}/${maxAttempts}`);
                await new Promise(r => setTimeout(r, RETRY_DELAY));
                continue;
            }
            console.warn(`⚠️  OFF (marque) échoué: ${err.message}`);
            throw err;
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

        const searchKey = normalizeString(terme.trim());

        // ✅ Vérifier le cache COMPLET (résultats ET recherches vides)
        const cached = searchCache.get(searchKey);
        if (cached) {
            console.log(`✅ Cache hit: "${terme}"`);
            res.set('Cache-Control', 'public, max-age=600');
            return res.json({ ...cached, fromCache: true });
        }

        const termeNormalize = normalizeString(terme.trim());

        // ── 1. Ciqual : toujours disponible, instantané ──────────────────────
        const ciqualResults = alimentsCiqual
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
            .slice(0, 10)
            .map(transformCiqualToProduct);

        console.log(`✅ Ciqual: ${ciqualResults.length} résultat(s)`);

        // ── 2. Open Food Facts : SEULEMENT si Ciqual n'a rien trouvé ──────────
        let offResults = [];
        let offSuccess = false;

        // ✅ Si Ciqual a trouvé au moins 1 résultat → SKIP OFF complètement
        if (ciqualResults.length > 0) {
            console.log(`✅ Ciqual a trouvé des résultats. Open Food Facts non sollicité.`);
            offSuccess = false;
        } else {
            // Sinon, chercher sur OFF
            // ✅ Vérifier si on a déjà essayé cette requête OFF et rien trouvé
            const isEmptyCached = searchCache.isEmptySearchCached(searchKey);

            if (isEmptyCached) {
                console.log(`⏭️  Recherche "${terme}" déjà testée en OFF → 0 résultats (cache). Skip.`);
                offSuccess = false;
            } else {
                try {
                    const offData = await Promise.race([
                        requestQueue.add(() => fetchFromOFF(terme.trim())),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('OFF_GLOBAL_TIMEOUT')), 20000) // 20s max global
                        )
                    ]);

                    offResults = (offData.products || [])
                        .filter(p => p.product_name && normalizeString(p.product_name).includes(termeNormalize))
                        .sort((a, b) => (b.unique_scans_n || 0) - (a.unique_scans_n || 0))
                        .slice(0, 15);

                    offSuccess = true;

                    // ✅ Si OFF retourne ZÉRO résultat, essayer la recherche par MARQUE
                    if (offResults.length === 0) {
                        console.log(`⚠️  OFF retourne 0 résultat. Tentative de recherche par MARQUE...`);
                        searchCache.markAsEmpty(searchKey);  // Mémoriser l'absence

                        try {
                            const offBrandData = await Promise.race([
                                requestQueue.add(() => fetchFromOFFByBrand(terme.trim())),
                                new Promise((_, reject) =>
                                    setTimeout(() => reject(new Error('OFF_BRAND_TIMEOUT')), 15000)
                                )
                            ]);

                            offResults = (offBrandData.products || [])
                                .filter(p => p.product_name)
                                .sort((a, b) => (b.unique_scans_n || 0) - (a.unique_scans_n || 0))
                                .slice(0, 10);

                            if (offResults.length > 0) {
                                console.log(`🎉 Recherche par marque réussie: ${offResults.length} produit(s)`);
                            }
                        } catch (brandErr) {
                            console.warn(`⚠️  Recherche par marque aussi infructueuse: ${brandErr.message}`);
                        }
                    } else {
                        console.log(`✅ OFF réussi: ${offResults.length} produit(s)`);
                    }

                } catch (offErr) {
                    console.warn(`⚠️  OFF non disponible. Erreur: ${offErr.message}`);
                    offSuccess = false;
                }
            }
        }

        // ── 3. Fusion intelligente (simplifiée) ────────────────────────────────
        // Stratégie prioritaire :
        // 1. Si Ciqual a trouvé → retourner Ciqual directement
        // 2. Si Ciqual vide + OFF a trouvé → retourner OFF
        // 3. Si rien trouvé → recherche approximative Ciqual
        // 4. Encore rien → 5 premiers aliments par défaut

        let finalProducts = [];
        let source = "ciqual_only";

        if (ciqualResults.length > 0) {
            // ✅ Ciqual a des résultats : c'est notre source prioritaire
            finalProducts = [...ciqualResults];
            source = "ciqual";
            console.log(`✅ Résultats trouvés dans Ciqual, retour direct.`);
        } else if (offResults.length > 0) {
            // OFF a trouvé quelque chose (Ciqual était vide)
            finalProducts = offResults;
            source = "off_only";
            console.log(`✅ Résultats trouvés dans OFF (Ciqual vide)`);
        } else {
            // FALLBACK : recherche approximative dans Ciqual
            console.warn(`⚠️  Aucun résultat exact. Recherche approximative...`);
            const words = termeNormalize.split(/\s+/).filter(w => w.length > 0);

            if (words.length > 0) {
                finalProducts = alimentsCiqual
                    .filter(a => {
                        const nom = normalizeString(a.nom);
                        // Au moins un mot correspond
                        return words.some(w => nom.includes(w));
                    })
                    .sort((a, b) => {
                        const nomA = normalizeString(a.nom);
                        const nomB = normalizeString(b.nom);
                        // Prioriser les matchs au début
                        const startA = nomA.startsWith(words[0]);
                        const startB = nomB.startsWith(words[0]);
                        if (startA && !startB) return -1;
                        if (!startA && startB) return 1;
                        return nomA.length - nomB.length;
                    })
                    .slice(0, 15)
                    .map(transformCiqualToProduct);

                source = "ciqual_approximated";
                console.log(`🔀 Recherche approximative: ${finalProducts.length} résultats`);
            }
        }

        // ── 4. Garantie finale : jamais de liste vide ──────────────────────────
        if (finalProducts.length === 0) {
            console.error(`❌ AUCUN RÉSULTAT TROUVÉ! Affichage des 5 premiers aliments Ciqual...`);
            finalProducts = alimentsCiqual.slice(0, 5).map(transformCiqualToProduct);
            source = "emergency_fallback";
        }

        const response = {
            products: finalProducts,
            source,
            offAvailable: offSuccess,
            resultsCount: finalProducts.length
        };

        // ✅ Sauvegarder le résultat dans le cache
        searchCache.set(searchKey, response);

        res.set('Cache-Control', 'public, max-age=600');
        return res.json(response);

    } catch (error) {
        console.error('❌ Erreur globale:', error.message);

        // GARANTIE ABSOLUE : toujours retourner quelque chose
        const { terme } = req.query;
        const termeNormalize = normalizeString(terme?.trim() || '');

        let fallbackResults = [];

        // Essai 1 : recherche exact dans Ciqual
        if (termeNormalize.length > 0) {
            fallbackResults = alimentsCiqual
                .filter(a => normalizeString(a.nom).includes(termeNormalize))
                .slice(0, 10)
                .map(transformCiqualToProduct);
        }

        // Essai 2 : recherche par première lettre
        if (fallbackResults.length === 0 && terme) {
            const firstLetter = terme[0].toLowerCase();
            fallbackResults = alimentsCiqual
                .filter(a => normalizeString(a.nom)[0] === firstLetter)
                .slice(0, 10)
                .map(transformCiqualToProduct);
        }

        // Essai 3 : 5 premiers aliments par défaut
        if (fallbackResults.length === 0) {
            fallbackResults = alimentsCiqual.slice(0, 5).map(transformCiqualToProduct);
        }

        console.log(`🆘 Fallback d'urgence: ${fallbackResults.length} résultats`);

        return res.status(200).json({
            products: fallbackResults,
            source: "emergency_fallback",
            offAvailable: false,
            resultsCount: fallbackResults.length,
            message: "Service partiellement disponible."
        });
    }
};