/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/usuarios.controller');

// Rutas
router.get("/", controller.getUsersView);
router.post("/anadir-usuario", controller.postNewUser); // No usar caracteres especiales en las rutas

module.exports = router;