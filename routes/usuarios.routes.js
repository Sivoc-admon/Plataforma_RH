/* --- Import routes.js logic --- */
const express = require("express");
const router = express.Router();
const controller = require('../controllers/usuarios.controller');

// Storage directory (critical)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/usuarios'); // Destination folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Collision avoidance
    const extension = path.extname(file.originalname);
    const newName = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, newName);
  }
});
const upload = multer({ storage }); // Compacted into 'upload'

// Routes
router.get("/", controller.getUsersView);
router.post("/anadir-usuario", controller.postNewUser); 
router.post("/subir-archivo", upload.single('file'), controller.postFileUpload);
router.post("/desactivar-usuario", controller.postUserDeactivation);
router.post("/activar-usuario", controller.postUserActivation);


module.exports = router;