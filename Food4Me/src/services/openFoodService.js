import { API_URL } from "../config/apiConfig";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2_000;

async function fetchWithTimeout(url, options = {}, timeoutMs) {
    const controller = new AbortController();
    const outerSignal = options.signal;

    if (outerSignal?.aborted) throw new DOMException("Aborted", "AbortError");

    const timer = setTimeout(() => controller.abort(), timeoutMs);
    outerSignal?.addEventListener("abort", () => controller.abort());

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

export const searchProducts = async (token, terme, signal) => {
    const headers = { "User-Agent": "Food4Me/1.0" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const url = `${API_URL}/off/search?terme=${encodeURIComponent(terme)}`;

    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        // Timeout progressif : commence à 8s, monte à 12s à partir du 3e essai
        const timeout = attempt <= 2 ? 8_000 : FETCH_TIMEOUT_MS;

        try {
            const response = await fetchWithTimeout(url, { headers, signal }, timeout);

            if (response.status === 429) throw new Error("RATE_LIMIT");
            if (response.status === 503) throw new Error("SERVICE_UNAVAILABLE");
            if (!response.ok) throw new Error(`HTTP_${response.status}`);

            return await response.json();

        } catch (err) {
            if (err.name === "AbortError") throw err;

            lastError = err;

            const isRetryable =
                err.message !== "RATE_LIMIT" &&
                err.message !== "SERVICE_UNAVAILABLE";

            if (isRetryable && attempt < MAX_RETRIES) {
                console.warn(`⚠️ Tentative ${attempt}/${MAX_RETRIES} — ${err.message}. Retry dans ${RETRY_DELAY_MS}ms…`);
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
                continue;
            }
            break;
        }
    }

    if (lastError?.message === "RATE_LIMIT") throw new Error("Trop de requêtes. Patientez quelques secondes.");
    if (lastError?.message === "SERVICE_UNAVAILABLE") throw new Error("Service momentanément indisponible.");
    throw new Error("Impossible de contacter le serveur. Vérifiez votre connexion.");
};

export const searchProductDirect = async (query) => {
    const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`,
        { headers: { "User-Agent": "Food4Me-App" } }
    );
    const data = await response.json();
    return data.products?.[0] || null;
};