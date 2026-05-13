const express = require("express");
const router = express.Router();
const offSearchController = require("../controllers/offSearchController");
const authenticateToken = require("../middlewares/auth");

router.get("/search", authenticateToken, offSearchController.search);

module.exports = router;