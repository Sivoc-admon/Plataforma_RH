/* --- Import routes.js logic --- */
const express = require('express');
const router = express.Router();
const controller = require("../controllers/permisos.controller");

// Rutas del módulo de usuarios
router.get('/verTableroPermisos', controller.verTableroPermisos);

module.exports = router;