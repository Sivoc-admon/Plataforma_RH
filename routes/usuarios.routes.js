/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/usuarios.controller');

// Rutas
router.get("/", controller.getUsersView);

module.exports = router;