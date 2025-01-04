/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/permisos.controller');

// Storage directory
const multer = require('multer');
const upload = multer({dest: 'public/uploads/permisos'});


// Rutas
router.get("/", controller.getPermitsView);


module.exports = router;