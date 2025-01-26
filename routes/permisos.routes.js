const express = require("express");
const router = express.Router();
const controller = require('../controllers/permisos.controller');

// Storage directory (critical)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/permisos'); // Destination folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Collision avoidance
    const extension = path.extname(file.originalname);
    const newName = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, newName);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // Compacted into 'upload'


// CHANGES:
// going to implement res.sendFile(); res.download(); and 'GET /descargar/file-1736156695153-456034020.jpg' fetches.
// forgor gitkeeps and ignores xd


// Rutas
router.get("/accessPermitsView", controller.accessPermitsView);

router.post("/uploadFile", upload.array('files', 3), controller.postFileUpload);



router.get('/downloadFile/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', 'permisos', req.params.filename);
  res.sendFile(filePath, (err) => {
      if (err) {
          console.error('Error al intentar servir el archivo PDF:', err);
          res.status(404).send('No se encontró el archivo PDF.');
      }
  });
});





router.post("/createPermitRequest", controller.createPermitRequest);

// Ruta para cargar archivos
  
module.exports = router;
