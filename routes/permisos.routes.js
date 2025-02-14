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
const allowedFileExtensions = ['png', 'jpeg', 'jpg', 'pdf', 'doc', 'docx'];
const MAX_SIZE_MB = 3 * 1024 * 1024; // 3MB in bytes
const upload = configureFileUpload("uploads/permisos", allowedFileTypes, allowedFileExtensions, MAX_SIZE_MB);


// 📌 Middleware para asegurar que req.files siempre sea un array
const ensureFilesArray = (req, res, next) => {
    if (!req.files) {
        req.files = [];
    }
    next();
};

router.post("/createPermitRequest", 
    ensureFilesArray,
    (req, res, next) => { 
        upload.array("files", 3)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ 
                    success: false, 
                    messageTitle: "Multer invalidation", 
                    messageText: err.message 
                });
            }
            next(); // Si no hay error, continuar con el controlador
        });
    },
controller.createPermitRequest);

router.post("/createPermitRequest",  upload.array('files', 3), controller.createPermitRequest);
router.get('/viewPermitsRowFile/:permitId/:filename', controller.viewPermitsRowFile);



// REMADE ROUTES
router.post("/changeStatus", controller.changeStatus);





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
