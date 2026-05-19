import { API_URL } from "../config/apiConfig";

// Ajouter un repas scanné
export const ajouterRepas = async (token, product) => {
    const response = await fetch(`${API_URL}/repas/ajouter-complet`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            nom_produit: product.product_name || "Produit inconnu",
            nutriments: {
                cal: Math.round(product.nutriments?.["energy-kcal_100g"] || 0),
                prot: product.nutriments?.proteins_100g || 0,
                glu: product.nutriments?.carbohydrates_100g || 0,
                lip: product.nutriments?.fat_100g || 0,
            },
            quantite: 100,
        }),
    });

    if (!response.ok) {
        console.error("❌ Erreur ajout repas:", response.status);
        throw new Error(`Erreur ${response.status}`);
    }

    return response.json();
};

// Sauvegarder un repas composé
export const saveComposedMeal = async (token, mealData) => {
    console.log("💾 Sauvegarde du repas composé:", mealData);

    const response = await fetch(`${API_URL}/repas/ajouter-complet`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mealData),
    });

    if (!response.ok) {
        console.error("❌ Erreur sauvegarde repas:", response.status);
        throw new Error(`Erreur ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Repas sauvegardé:", data);
    return data;
};

// Récupérer les totaux du jour
export const getDailyTotals = async (token) => {
    try {
        console.log("📤 Appel GET /repas/aujourdhui avec token...");

        const response = await fetch(`${API_URL}/repas/aujourdhui`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("📥 Status réponse:", response.status);

        if (!response.ok) {
            console.error("❌ Erreur récupération totals:", response.status);
            throw new Error(`Erreur ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Totals reçus:", data);
        return data;
    } catch (err) {
        console.error("❌ Erreur fetching totals:", err);
        throw err;
    }
};