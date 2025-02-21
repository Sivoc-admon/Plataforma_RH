const express = require("express");
const router = express.Router();
const controller = require('../controllers/permisos.controller');
const configureFileUpload = require("../utils/configureFileUpload");

// File upload validation & configuration
const ensureFilesArray = (req, res, next) => {
    if (!req.files)
        req.files = [];
    next();
};
const allowedFileExtensions = ['png', 'jpeg', 'jpg', 'pdf', 'doc', 'docx'];
const MAX_SIZE_MB = 3 * 1024 * 1024; // 3MB in bytes
const allowedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// createPermitRequest : Colaborador : Done
const upload = configureFileUpload("uploads/permisos", allowedFileTypes, allowedFileExtensions, MAX_SIZE_MB);
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

// viewPermitsRowFile : Colaborador, JefeInmediato, rHumanos : Done
router.get('/viewPermitsRowFile/:permitId/:filename', controller.viewPermitsRowFile);

// editPermit : Colaborador : Done
router.post('/editPermit/getInfo', controller.editPermit_getInfo);
router.post('/editPermit/postInfo', 
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
    controller.editPermit_postInfo);

// deletePermit : Colaborador : Done
router.delete('/deletePermit', controller.deletePermit);

// sendPermit : Colaborador : Done
router.post("/sendPermit", controller.sendPermit);

// changeStatus : jefeInmediato, rHumanos : Done
router.post("/changeStatus", controller.changeStatus);

// changeStatus : jefeInmediato, rHumanos : Done
router.post("/verifyPermit", controller.verifyPermit);

// verifyPermit : jefeInmediato, rHumanos : Done
router.get("/downloadPDF", controller.downloadPDF);

// verifyPermit : jefeInmediato, rHumanos : Done
router.get("/downloadExcel", controller.downloadExcel);

// accessPermitsModule : Colaborador, JefeInmediato, rHumanos : Done
router.get("/accessPermitsModule", controller.accessPermitsModule);
  
module.exports = router;