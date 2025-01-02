/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/usuarios.controller');
const multer = require('multer');
const upload = multer({dest: 'public/uploads/usuarios'}); // Module specified multer


// Rutas
router.get("/", controller.getUsersView);
router.post("/anadir-usuario", controller.postNewUser); // No usar caracteres especiales en las rutas
router.post("/miPrimerArchivo", upload.single('file'), controller.postFirstFile);


module.exports = router;