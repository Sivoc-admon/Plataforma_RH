const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Middleware global para sanitización y gestión de subir archivos
 *
 * @param {string} uploadDir - Directory where files will be stored
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @param {string[]} allowedExtensions - Array of allowed file extensions
 * @param {number} MAX_SIZE_MB - Maximum file size in megabytes
 * @param {number} MAX_FILES - Maximum number of files allowed
 * @returns {multer.Multer} Configured multer middleware
 */
const configureUpload = (uploadDir, allowedTypes, allowedExtensions, MAX_SIZE_MB, MAX_FILES) => {
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        /**
         * 
         * 
         * @param {Express.Request} request - Objeto de solicitud
         * @param {Express.Multer.File} file - Objeto que contiene el archivo
         * @param {Function} callback - Función que se ejecutará al terminar la operación
         *
         */
        destination: function (request, file, callback) {
            callback(null, uploadDir);
        },
        /**
         * 
         * 
         * @param {Express.Request} request - Objeto de solicitud
         * @param {Express.Multer.File} file - Objeto de respuesta
         * @param {Function} callback - Función que se ejecutará al terminar la operación
         */
        filename: function (request, file, callback) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const extension = path.extname(file.originalname);
            const newName = file.fieldname + '-' + uniqueSuffix + extension;
            callback(null, newName);
        }
    });

    /**
     * File filter with enhanced security validations
     * @param {Express.Request} request - Objeto de solicitud
     * @param {Express.Multer.File} file - Objeto que contiene el archivo
     * @param {Function} callback - Función que se ejecutará al terminar la operación.
     */
    const fileFilter = (request, file, callback) => {
        // Note: request.files might not be available during fileFilter execution
        // File count validation should be done in a separate middleware after multer processing

        // Validate filename - sanitize and check for malicious patterns
        const originalName = file.originalname || '';
        const sanitizedName = originalName.replace(/[<>:"'/\\|?*\x00-\x1f]/g, '').substring(0, 255);

        // Check for empty filename after sanitization
        if (!sanitizedName.trim()) {
            return callback(new Error('Nombre de archivo inválido'));
        }

        // Validate file extension
        const fileExtension = path.extname(originalName).toLowerCase().substring(1);
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
            return callback(new Error('Tipo de archivo no permitido'));
        }

        // Validate mime type
        if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
            return callback(new Error('Tipo MIME no permitido'));
        }

        // Check for null bytes and other security issues
        if (originalName.includes('\x00') || originalName.includes('..')) {
            return callback(new Error('Se ha detectado un intento de actividad maliciosa'));
        }

        callback(null, true);
    };

    // Configure multer middleware with all validations
    const upload = multer({
        storage,
        limits: {
            fileSize: MAX_SIZE_MB * 1024 * 1024, // Convert MB to bytes
            files: MAX_FILES,
            fields: 10, // Limit form fields
            parts: MAX_FILES + 10 // Limit total parts
        },
        fileFilter
    });

    // Create a wrapper that includes file count validation
    const uploadWithValidation = {
        /**
         *
         * @param fieldName
         */
        single: (fieldName) => {
            return [
                upload.single(fieldName),
                (request, res, next) => {
                    // Additional validation after multer processing
                    if (request.file && request.files && request.files.length > MAX_FILES) {
                        return next(new Error('Número máximo de archivos excedido'));
                    }
                    next();
                }
            ];
        },

        /**
         *
         * @param fieldName
         * @param maxCount
         */
        array: (fieldName, maxCount = MAX_FILES) => {
            const actualMaxCount = Math.min(maxCount, MAX_FILES);
            return [
                upload.array(fieldName, actualMaxCount),
                (request, res, next) => {
                    if (request.files && request.files.length > actualMaxCount) {
                        return next(new Error('Número máximo de archivos excedido'));
                    }
                    next();
                }
            ];
        },

        /**
         *
         * @param fields
         */
        fields: (fields) => {
            return [
                upload.fields(fields),
                (request, res, next) => {
                    let totalFiles = 0;
                    if (request.files) {
                        Object.keys(request.files).forEach(key => {
                            totalFiles += request.files[key].length;
                        });
                    }
                    if (totalFiles > MAX_FILES) {
                        return next(new Error('Número máximo de archivos excedido'));
                    }
                    next();
                }
            ];
        },

        // Expose the original multer instance for direct use if needed
        multer: upload
    };

    return uploadWithValidation;
};

module.exports = configureUpload;