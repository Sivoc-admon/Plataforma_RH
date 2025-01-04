/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/usuarios.controller');

// Storage directory
const multer = require('multer');
const upload = multer({dest: 'public/uploads/usuarios'});


// Rutas
router.get("/", controller.getUsersView);
router.post("/anadir-usuario", controller.postNewUser); 

router.post("/procesar-achivo", upload.single('file'), controller.postFirstFile);
// el subir el archivo debe ser en binario, y el json de respuesta
// peso máximo de archivos 10MB


module.exports = router;