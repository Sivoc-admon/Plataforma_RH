/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/login.controller');

// Rutas
router.get("/", controller.getLoginView);
router.post("/POSTAUTH", controller.postAuthentication);

module.exports = router;