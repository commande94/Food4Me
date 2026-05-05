export const searchProduct = async (query) => {
    const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`,
        {
            headers: {
                "User-Agent": "Food4Me-App"
            }
        }
    );

    const data = await response.json();
    return data.products?.[0] || null;
};