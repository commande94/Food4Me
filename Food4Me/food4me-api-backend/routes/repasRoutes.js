const express = require("express");
const router = express.Router();
const repasController = require("../controllers/repasController");
const authenticateToken = require("../middlewares/auth");

router.post("/ajouter", authenticateToken, repasController.ajouterRepas);
router.post("/ajouter-complet", authenticateToken, repasController.ajouterRepasComplet);
router.post("/ajouter-compose", authenticateToken, repasController.ajouterRepaseCompose);
router.get("/aujourdhui", authenticateToken, repasController.aujourdhui);
router.get("/liste-aujourdhui", authenticateToken, repasController.listeAujourdhui);
router.get("/:id/detail", authenticateToken, repasController.detailRepas);
router.put("/:id/composition", authenticateToken, repasController.modifierComposition);
router.delete("/:id", authenticateToken, repasController.supprimerRepas);
router.put("/:id", authenticateToken, repasController.renommerRepas);

module.exports = router;