/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/cursos.controller');

// Rutas
router.get("/", controller.getCoursesView);

module.exports = router;