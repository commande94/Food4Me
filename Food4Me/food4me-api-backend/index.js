const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const repasRoutes = require("./routes/repasRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/auth", authRoutes);
app.use("/repas", repasRoutes);

app.listen(3000, () => {
    console.log("🚀 Serveur lancé sur port 3000");
});
