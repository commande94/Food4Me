const express = require("express");
const router = express.Router();
const repasController = require("../controllers/repasController");
const authenticateToken = require("../middlewares/auth");

router.post("/ajouter", authenticateToken, repasController.ajouterRepas);
router.post("/ajouter-complet", authenticateToken, repasController.ajouterRepasComplet);
router.get("/aujourdhui", authenticateToken, repasController.aujourdhui);

module.exports = router;