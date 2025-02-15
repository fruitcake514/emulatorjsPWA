const express = require("express");
const { uploadRom } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/upload-rom", authMiddleware, uploadRom);

module.exports = router;
