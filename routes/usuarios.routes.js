/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/usuarios.controller');

// Rutas
router.get("/", controller.getUsersView);
router.post("/añadir-usuario", controller.postNewUser);

module.exports = router;