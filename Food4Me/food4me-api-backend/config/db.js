const { Pool } = require("pg");
const dns = require("dns");
require("dotenv").config();

// Force IPv4 - Railway ne supporte pas IPv6
dns.setDefaultResultOrder("ipv4first");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // ✅ FIX SUPABASE
    ssl: {
        rejectUnauthorized: false
    },

    // ✅ OPTIMISATION POOL (FIX ERREUR RESEAU)
    max: 20,                        // Max 20 connexions (au lieu de 10)
    idleTimeoutMillis: 30000,       // Fermer les connexions inactives après 30s
    connectionTimeoutMillis: 5000   // Timeout de connexion: 5s
});

pool.on("connect", () => {
    console.log("✅ PostgreSQL connecté (Supabase)");
});

pool.on("error", (err) => {
    console.error("❌ Erreur DB:", err.message);
});

// ✅ GRACEFUL SHUTDOWN
process.on("SIGTERM", async () => {
    console.log("🛑 SIGTERM reçu, fermeture du pool...");
    await pool.end();
    process.exit(0);
});

module.exports = pool;