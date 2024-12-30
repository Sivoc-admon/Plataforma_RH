/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/permisos.controller');


const multer = require('multer');
const upload = multer({dest: 'public/uploads/permisos'}); // Module specified multer


// Rutas
router.get("/", controller.getPermitsView);
router.post("/miPrimerArchivo", upload.single('file'), controller.postFirstFile);
// el subir el archivo debe ser en binario, y el json de respuesta
// peso máximo de archivos 10MB

module.exports = router;