const alimentsCiqual = require('../config/ciqual');
let lastOffRequestTime = 0;
const MIN_OFF_INTERVAL = 1500;

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
            fat_100g: item.lipides
        }
    };
}

exports.search = async (req, res) => {
    try {
        let { terme } = req.query;
        if (!terme) return res.status(400).json({ error: "Terme de recherche requis" });
        terme = terme.trim();
        const termeLower = terme.toLowerCase();

        // 1. Recherche locale Ciqual
        const resultatsLocaux = alimentsCiqual
            .filter(a => a.nom.toLowerCase().includes(termeLower))
            .slice(0, 15);

        if (resultatsLocaux.length > 0) {
            const produits = resultatsLocaux.map(transformCiqualToProduct);
            return res.json({ products: produits });
        }

        // 2. Fallback Open Food Facts
        const now = Date.now();
        if (now - lastOffRequestTime < MIN_OFF_INTERVAL) {
            const waitTime = MIN_OFF_INTERVAL - (now - lastOffRequestTime);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        lastOffRequestTime = Date.now();

        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(terme)}&json=1&page_size=50&nocache=${Date.now()}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Food4Me/1.0' },
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.status === 429) return res.status(429).json({ error: "Trop de requêtes" });
        if (!response.ok) return res.status(502).json({ error: `OFF erreur ${response.status}` });

        const data = await response.json();
        let products = (data.products || []).filter(p =>
            (p.product_name || '').toLowerCase().includes(termeLower)
        );
        if (products.length === 0) products = data.products || [];
        products.sort((a, b) => (b.unique_scans_n || 0) - (a.unique_scans_n || 0));
        const finalProducts = products.slice(0, 10);

        res.set('Cache-Control', 'no-store');
        res.json({ products: finalProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur recherche" });
    }
};