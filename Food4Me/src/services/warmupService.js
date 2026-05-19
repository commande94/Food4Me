import { API_URL } from "../config/apiConfig";

/**
 * Réveille le backend dès le lancement de l'app (cold-start Render / Railway).
 * Appel silencieux : aucune erreur n'est propagée, c'est best-effort.
 * À appeler dans App.js via useEffect au montage.
 */
export const warmupBackend = async () => {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000); // 30s max pour un cold-start
        await fetch(`${API_URL}/health`, { signal: controller.signal });
        clearTimeout(timer);
        console.log("✅ Backend réveillé");
    } catch {
        // Silencieux — le but est juste de déclencher le cold-start en avance
    }
};