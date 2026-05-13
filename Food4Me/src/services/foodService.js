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
    return response.json();
};

// Sauvegarder un repas composé
export const saveComposedMeal = async (token, mealData) => {
    const response = await fetch(`${API_URL}/repas/ajouter-complet`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mealData),
    });
    return response.json();
};

// Récupérer les totaux du jour
export const getDailyTotals = async (token) => {
    const response = await fetch(`${API_URL}/repas/aujourdhui`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};