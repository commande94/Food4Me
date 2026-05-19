const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const repasRoutes = require("./routes/repasRoutes");
const ingredientsRoutes = require("./routes/ingredientsRoutes");
const offSearchRoutes = require("./routes/offSearchRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/repas", repasRoutes);
app.use("/ingredients", ingredientsRoutes);
app.use("/off", offSearchRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Backend Food4Me lancé ✅" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
🚀 ================================
🚀 Serveur lancé sur le port ${PORT}
🚀 API URL: http://localhost:${PORT}
🚀 CORS: Activé
🚀 ================================
    `);
});