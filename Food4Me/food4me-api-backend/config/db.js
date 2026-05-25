const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // ✅ FIX SUPABASE
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("connect", () => {
    console.log("✅ PostgreSQL connecté (Supabase)");
});

pool.on("error", (err) => {
    console.error("❌ Erreur DB:", err.message);
});

module.exports = pool;