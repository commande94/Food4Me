const express = require("express");
const router = express.Router();

const repasController = require("../controllers/repasController");

router.post("/ajouter", repasController.ajouterRepas);
router.post("/ajouter-complet", repasController.ajouterRepasComplet);

module.exports = router;