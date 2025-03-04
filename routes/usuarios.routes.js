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

// createPermitRequest : Colaborador : Done
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





// accessUsersModule : jefeInmediato, rHumanos : ---
router.get("/accessUsersModule", controller.accessUsersModule);

//  : -- : ----
exports.editPermit_getInfo = async (req, res) => {
    try {
        const { permitId } = req.body;

        if (!permitId || typeof permitId !== "string") {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#011)"
            });
        }

        const permit = await permitsModel.findOne({
            _id: permitId,
            isSent: false,
            isVerified: false
        }).populate('docPaths', 'originalname').select('-__v');

        if (!permit) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#013)"
            });
        }

        return res.status(200).json({ success: true, message: permit });

    } catch (error) {
        return res.status(500).json({
            success: false,
            messageTitle: "Error",
            messageText: "Tomar captura y favor de informar a soporte técnico. (#012)"
        });
    }
};

// editPermit : -- : -- (2 skips)
exports.editPermit_postInfo = async (req, res) => {
    try {
        // Validate request fields
        const allowedFields = ["permitId", "filtro", "fechaInicio", "fechaTermino", "archivosSeleccionados", "files"];
        const receivedFields = Object.keys(req.body);

        if (receivedFields.some(field => !allowedFields.includes(field))) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#035)"
            });
        }

        const { permitId, filtro, fechaInicio, fechaTermino, archivosSeleccionados } = req.body;

        if ([permitId, filtro, fechaInicio, fechaTermino, archivosSeleccionados].some(
            field => typeof field !== "string") || !permitId) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#036)"
            });
        }

        const permitData = await permitsModel.findOne({
            _id: permitId,
            isSent: false,
            isVerified: false
        }).populate('docPaths', '_id filename originalname').select('-__v');

        if (!permitData) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar.(#034)"
            });
        }

        if (permitData.userId != res.locals.userId) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar.(#45)"
            });
        }

        // (skip) validate filtro
        // (skip) validate filtro
        // (skip) validate filtro

        // (skip) validate dates
        // (skip) validate dates
        // (skip) validate dates

        let paths = [];
        const dataArray = permitData.docPaths;
        const parsedFilesArray = JSON.parse(archivosSeleccionados);
        const reqFilesObject = req.files;

        // First, process each item in dataArray (current files in DB)
        for (const item of dataArray) {
            // Check if this file is being replaced by a new upload
            const isBeingReplaced = reqFilesObject.some(file => file.originalname === item.originalname);
            // Check if this file was selected to keep
            const isSelected = parsedFilesArray.some(file => file.name === item.originalname);

            // Delete if:
            // - File is being replaced by new upload OR
            // - File wasn't selected to keep
            if (isBeingReplaced || !isSelected) {
                const filePath = path.join(__dirname, '..', 'uploads', 'permisos', item.filename);
                try {
                    await fs.promises.unlink(filePath);
                    await filesModel.deleteOne({ _id: item._id });
                } catch (err) {
                    return res.status(500).json({
                        success: false,
                        messageTitle: "Error",
                        messageText: "Tomar captura y favor de informar a soporte técnico.(#055)"
                    });
                }
            } else {
                // Keep file if it's selected and not being replaced
                paths.push(item);
            }
        }

        // Add new files to paths
        if (req.files && req.files.length > 0) {
            const docResponses = await Promise.all(
                req.files.map(file => filesModel.create(file))
            );
            paths = [...paths, ...docResponses];  // Combine old and new files
        }

        const payload = {
            ...(filtro && { filtro }),
            ...(fechaInicio && { fechaInicio: fechaInicio }),
            ...(fechaTermino && { fechaTermino: fechaTermino }),
            ...(paths.length > 0 && { docPaths: paths })
        };

        await permitsModel.findByIdAndUpdate(
            permitId,
            { $set: payload },
            { new: true, runValidators: true }
        );

        return res.status(200).json({ success: true });

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#006)"
            });
        }
        return res.status(500).json({
            success: false,
            messageTitle: "Error",
            messageText: "Tomar captura y favor de informar a soporte técnico. (#040)"
        });
    }
};







router.post("/downloadExcelUsers", controller.postDownloadExcelUsers);
router.post("/downloadPDFUsers", controller.postDownloadPDFUsers);
router.get("/restoreUsersView", controller.getRestoreUsersView);

router.post("/uploadFile", upload.single('file'), controller.postFileUpload);
router.post("/deactivateUser", controller.postUserDeactivation);
router.post("/activateUser", controller.postUserActivation);
router.post("/changePrivilege", controller.postUserChangePrivilege);

router.post("/editUser", controller.postEditUser); 

module.exports = router;