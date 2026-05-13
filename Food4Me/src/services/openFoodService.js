import { API_URL } from "../config/apiConfig";

export const searchProducts = async (token, terme, signal) => {
    const response = await fetch(
        `${API_URL}/off/search?terme=${encodeURIComponent(terme)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            signal,
        }
    );

    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (response.status === 503) throw new Error("SERVICE_UNAVAILABLE");
    return response.json();
};

// Ancienne recherche directe (conservée si besoin)
export const searchProductDirect = async (query) => {
    const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`,
        { headers: { "User-Agent": "Food4Me-App" } }
    );
    const data = await response.json();
    return data.products?.[0] || null;
};