import { API_URL } from "../config/apiConfig";

/**
 * Recherche des ingrédients dans la base de données (Ciqual + OpenFoodFacts)
 * @param {string} nom - Le terme recherché
 * @param {AbortSignal} signal - Le signal d'annulation pour le "as you type"
 */
export const searchIngredients = async (nom, signal) => {
    try {
        console.log("🔍 Recherche d'ingrédients:", nom);

        // Utilise la route globale du backend /off/search
        const response = await fetch(
            `${API_URL}/off/search?terme=${encodeURIComponent(nom)}`,
            { signal } // Associe le signal d'annulation à la requête HTTP
        );

        if (!response.ok) {
            console.error("❌ Erreur recherche:", response.status);
            return { ingredients: [] };
        }

        const data = await response.json();

        // Conversion du format de réponse OpenFoodFacts/Ciqual vers le format attendu par ComposeScreen
        const ingredients = (data.products || []).map(p => {
            const nut = p.nutriments || {};

            return {
                id_ingredient: p.code || Math.random().toString(),
                nom: p.product_name || "Produit inconnu",
                calories_pour_100g: parseFloat(nut["energy-kcal_100g"]) || 0,
                proteines_pour_100g: parseFloat(nut.proteins_100g) || 0,
                glucides_pour_100g: parseFloat(nut.carbohydrates_100g) || 0,
                lipides_pour_100g: parseFloat(nut.fat_100g) || 0,
            };
        });

        console.log(`✅ ${ingredients.length} résultats trouvés pour "${nom}"`);
        return { ingredients };
    } catch (err) {
        // Si l'erreur provient d'une annulation volontaire via l'AbortController, on l'ignore silencieusement
        if (err.name === 'AbortError') {
            return { ingredients: [] };
        }

        console.error("❌ Erreur recherche ingrédients:", err);
        return { ingredients: [] };
    }
};