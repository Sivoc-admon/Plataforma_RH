const express = require("express");
const router = express.Router();
const controller = require('../controllers/permisos.controller');


// 📌 Route specifically designed
const configureFileUpload = require("../utils/configureFileUpload");
const allowedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];
const upload = configureFileUpload("uploads/permisos", allowedFileTypes);
router.post("/createPermitRequest", upload.array('files', 3), controller.createPermitRequest);


// REMADE ROUTES
router.get('/viewPermitsRowFile/:filename', controller.viewPermitsRowFile);
router.post("/changeStatus", controller.changeStatus);




// CHANGES:
// going to implement res.sendFile(); res.download(); and 'GET /descargar/file-1736156695153-456034020.jpg' fetches.
// forgor gitkeeps and ignores xd
// Rutas
router.get("/accessPermitsModule", controller.accessPermitsModule);

//router.get('/downloadFile/:filename', controller.getFileDownload);


router.delete('/deleteFile', controller.deleteFile);
router.post("/editPermit", controller.postEditPermit);
router.delete('/deletePermit', controller.deletePermit);
router.post("/sendPermit", controller.postSendPermit);



router.post("/verifyPermit", controller.postVerifyPermit);


router.get("/downloadPDF", controller.getDownloadPDF);




// Ruta para cargar archivos
  
module.exports = router;
