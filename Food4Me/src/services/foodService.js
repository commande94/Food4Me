import { API_URL } from "../config/apiConfig";

export const ajouterRepas = async (product, userId) => {
    const response = await fetch(`${API_URL}/repas/ajouter-complet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_profil: userId,
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

    return response;
};