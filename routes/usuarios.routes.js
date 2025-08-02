/* --- Import routes.js logic --- */
const express = require('express');
const router = express.Router();
const { verTableroActivados } = require("../controllers/usuarios.controller");

// Rutas del módulo de usuarios
router.get('/', verTableroActivados);

module.exports = router;