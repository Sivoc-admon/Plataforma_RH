/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/login.controller');

// Rutas
router.get("/", controller.getLogin);
router.get("/login", controller.getLogin);
router.post("/POSTAUTH", controller.postAuthentication);
router.get("/homepage", controller.getHomepage);

module.exports = router;