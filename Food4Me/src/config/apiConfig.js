import Constants from "expo-constants";

function getDevServerHost() {
    const debuggerHost =
        Constants.expoGoConfig?.debuggerHost ??
        Constants.expoConfig?.hostUri;

    if (!debuggerHost) return null;

    return debuggerHost.split(":")[0];
}

const devHost = getDevServerHost();

// Utilise la même IP qu'Expo (exp://IP:8081) → plus besoin de la changer à la main
export const API_URL =
    process.env.EXPO_PUBLIC_API_URL ??
    (devHost ? `http://${devHost}:3000` : "http://192.168.1.140:3000");
