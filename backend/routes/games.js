const express = require("express");
const { getGames } = require("../controllers/gameController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getGames);

module.exports = router;
