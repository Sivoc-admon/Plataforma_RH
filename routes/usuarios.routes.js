const express = require("express");
const router = express.Router();
const controller = require('../controllers/usuarios.controller');
const configureFileUpload = require("../utils/configureFileUpload");

// File upload validation & configuration
const ensureFilesArray = (req, res, next) => {
    if (!req.files)
        req.files = [];
    next();
};
const allowedFileExtensions = ['png', 'jpeg', 'jpg'];
const MAX_SIZE_MB = 3 * 1024 * 1024; // 3MB in bytes
const allowedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
];
const MAX_FILES = 1;

// accessUsersModule : rHumanos : Done
router.get("/accessUsersModule", controller.accessUsersModule);

// addUser : rHumanos : Done
const upload = configureFileUpload("uploads/usuarios", allowedFileTypes, allowedFileExtensions, MAX_SIZE_MB, MAX_FILES);
router.post("/addUser",
    ensureFilesArray,
    (req, res, next) => { 
        upload.array("files", MAX_FILES)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ 
                    success: false, 
                    messageTitle: "Error con el archivo", 
                    messageText: "El archivo se encuentra en un formato inválido"
                });
            }
            next(); // Si no hay error, continuar con el controlador
        });
    },
controller.addUser);
router.post("/doesEmailExists", controller.doesEmailExists)

// restoreUsersView : rHumanos : Done
router.get("/restoreUsersView", controller.restoreUsersView);

// activateUser : rHumanos : Done
router.post("/activateUser", controller.activateUser);

// restoreUsersView : rHumanos : Done
router.get("/configureTeamView", controller.configureTeamView);

// downloadPDF : rHumanos : Done
router.get("/downloadPDF", controller.downloadPDF);

// downloadExcel : rHumanos : ---
router.get("/downloadExcel", controller.downloadExcel);





router.post("/deactivateUser", controller.postUserDeactivation);
router.post("/changePrivilege", controller.postUserChangePrivilege);
router.post("/editUser", controller.postEditUser); 

module.exports = router;