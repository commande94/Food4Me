import { API_URL } from "../config/apiConfig";

export const searchIngredients = async (nom) => {
    const response = await fetch(
        `${API_URL}/ingredients/recherche?nom=${encodeURIComponent(nom)}`
    );
    return response.json();
};