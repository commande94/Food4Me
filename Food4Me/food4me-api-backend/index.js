const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const repasRoutes = require("./routes/repasRoutes");
const ingredientsRoutes = require("./routes/ingredientsRoutes");
const offSearchRoutes = require("./routes/offSearchRoutes");
const pool = require("./config/db");

const app = express();

// ✅ CORS CONFIGURATION
app.use(cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MIDDLEWARE DE LOG POUR DEBUG
app.use((req, res, next) => {
    console.log(`📨 [${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/repas", repasRoutes);
app.use("/ingredients", ingredientsRoutes);
app.use("/off", offSearchRoutes);

// Health check - SANS POOL QUERY (pour isoler le problème)
app.get("/health", (req, res) => {
    console.log("✅ /health endpoint appelé");
    res.json({
        status: "ok",
        message: "Backend Food4Me lancé ✅",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("❌ ERREUR NON GÉRÉE:", err);
    res.status(500).json({
        message: "Erreur serveur",
        error: err.message
    });
});

// ✅ 404 HANDLER
app.use((req, res) => {
    console.warn(`⚠️  Route non trouvée: ${req.method} ${req.path}`);
    res.status(404).json({ message: "Route non trouvée" });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`
🚀 ================================
🚀 Backend Food4Me lancé
🚀 Port: ${PORT}
🚀 📝 À CONFIGURER: src/config/apiConfig.js
🚀 CORS: Activé pour tous les origins
🚀 ================================
    `);
});

// ✅ TIMEOUT GLOBAL
server.setTimeout(60000); // 60 secondes

// ✅ GRACEFUL SHUTDOWN
process.on("SIGINT", async () => {
    console.log("\n🛑 SIGINT reçu, fermeture...");
    server.close(() => {
        console.log("✅ Serveur fermé");
        pool.end(() => {
            console.log("✅ Pool DB fermé");
            process.exit(0);
        });
    });
    setTimeout(() => process.exit(1), 10000);
});