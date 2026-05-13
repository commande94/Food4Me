const express = require("express");
const router = express.Router();
const ingredientsController = require("../controllers/ingredientsController");
const authenticateToken = require("../middlewares/auth");

router.get("/recherche", ingredientsController.recherche); // public
router.post("/ajouter", authenticateToken, ingredientsController.ajouter);

module.exports = router;