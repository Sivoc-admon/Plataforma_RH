/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/permisos.controller');

// Rutas
router.get("/", controller.getPermitsView);

module.exports = router;