/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const path = require('path');
const multer = require('multer');
const controller = require('../controllers/permisos.controller');

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Verifica que el directorio existe o lanza un error si no
    cb(null, 'public/uploads/permisos'); // Carpeta destino para guardar los archivos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Evita colisiones en los nombres
    const extension = path.extname(file.originalname);
    const newName = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, newName);
  }
});

// Validación de tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.png', '.jpeg', '.jpg', '.pdf', '.doc', '.docx'];
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(extension)) {
    cb(null, true); // Acepta el archivo
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${extension}. Solo se permiten ${allowedTypes.join(', ')}`), false); // Rechaza el archivo
  }
};

// Límite de tamaño (5 MB en este caso)
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite en bytes (5 MB)
});

// Rutas
router.get("/accessPermitsView", controller.accessPermitsView);

// Ruta para cargar archivos
router.post("/uploadFile", upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No se subió ningún archivo o el tipo de archivo no es válido.");
    }

    // Si todo va bien
    res.status(200).send({
      message: "Archivo subido exitosamente.",
      file: req.file // Devuelve información del archivo subido
    });
  } catch (err) {
    console.error("Error en la subida del archivo:", err.message);
    res.status(500).send({ error: "Error al subir el archivo." });
  }
});

// Colaborador fetches
// Aquí puedes agregar tus rutas para colaboradores

// Jefe Inmediato fetches
// Aquí puedes agregar tus rutas para jefe inmediato

// Recursos Humanos fetches
// Aquí puedes agregar tus rutas para recursos humanos

module.exports = router;
