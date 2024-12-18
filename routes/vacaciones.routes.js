/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/vacaciones.controller');

// Rutas
router.get("/", controller.getVacationsView);

module.exports = router;