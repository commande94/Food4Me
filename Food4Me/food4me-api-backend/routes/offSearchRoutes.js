const express = require("express");
const router = express.Router();
const offSearchController = require("../controllers/offSearchController");

// Public - pas d'authentification nécessaire pour chercher des produits
router.get("/search", offSearchController.search);

module.exports = router;