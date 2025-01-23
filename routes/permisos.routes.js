const express = require("express");
const router = express.Router();
const controller = require('../controllers/permisos.controller');

// Storage directory (critical)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/permisos'); // Destination folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Collision avoidance
    const extension = path.extname(file.originalname);
    const newName = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, newName);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // Compacted into 'upload'


// Rutas
router.get("/accessPermitsView", controller.accessPermitsView);

router.post("/uploadFile", upload.array('files', 3), controller.postFileUpload);

router.post("/createPermitRequest", controller.createPermitRequest);


// Ruta para cargar archivos
  
module.exports = router;
