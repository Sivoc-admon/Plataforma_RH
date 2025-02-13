const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Constants for file validation
const MAX_FILES = 3;

const configureUpload = (uploadDir, allowedTypes, allowedExtensions, MAX_SIZE_MB) => {
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const extension = path.extname(file.originalname);
            const newName = file.fieldname + "-" + uniqueSuffix + extension;
            cb(null, newName);
        }
    });

    // File filter with enhanced security validations
    const fileFilter = (req, file, cb) => {


            // Check number of files
            if (req.files.length >= MAX_FILES) {
                return cb(new Error("1Se ha detectado un intento de actividad maliciosa."));
            }

            // Validate filename
            const sanitizedName = file.originalname.replace(/[<>:"'/\\|?*]/g, "").substring(0, 51) || "unknown_file";
            if (sanitizedName !== file.originalname) {
                return cb(new Error("2Se ha detectado un intento de actividad maliciosa."));
            }

            // Validate file extension
            const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
            if (!allowedExtensions.includes(fileExtension)) {
                return cb(new Error("3Se ha detectado un intento de actividad maliciosa."));
            }

            // Validate mime type
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new Error("4Se ha detectado un intento de actividad maliciosa."));
            }

            cb(null, true);

    };

    // Configure multer middleware with all validations
    const upload = multer({
        storage,
        limits: { 
            fileSize: MAX_SIZE_MB,
            files: MAX_FILES
        },
        fileFilter
    });


    // Return both the multer middleware and the validation middleware
    return upload;
};

module.exports = configureUpload;