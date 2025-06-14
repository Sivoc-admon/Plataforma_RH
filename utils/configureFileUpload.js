const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Constantes
const BYTES_PER_MB = 1024 * 1024;
const RANDOM_MULTIPLIER = 1e9;
const MAX_FILENAME_LENGTH = 255;
const MAX_FORM_FIELDS = 10;
const NULL_BYTE = '\x00';
const PATH_TRAVERSAL = '..';

/**
 * Crea el directorio de subida si no existe.
 * @function
 * @param {string} uploadDirectory - Directorio donde se almacenarán los archivos.
 * @returns {void}
 */
function createUploadDirectory(uploadDirectory) {
    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
    }
}

/**
 * Genera un nombre único para el archivo subido.
 * @function
 * @param {string} fieldname - Nombre del campo del formulario.
 * @param {string} originalname - Nombre original del archivo.
 * @returns {string} Nombre único generado para el archivo.
 */
function generateUniqueFilename(fieldname, originalname) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * RANDOM_MULTIPLIER);
    const extension = path.extname(originalname);
    return fieldname + '-' + uniqueSuffix + extension;
}

/**
 * Sanitize a filename by removing unsafe or invalid characters.
 * Removes reserved characters and trims the result to a safe length.
 *
 * @param {string} filename - The original filename
 * @returns {string} - The sanitized filename
 */
function sanitizeFilename(filename) {
    const MAX_FILENAME_LENGTH = 255; // Define or ensure this is declared elsewhere

    if (typeof filename !== 'string' || filename.trim() === '') {
        return '';
    }

    // Regex to remove invalid filename characters: < > : " / \ | ? * and control chars
    const unsafeChars = /[<>:"'/\\|?*\u0000-\u001F]/g;

    return filename
        .replace(unsafeChars, '')
        .substring(0, MAX_FILENAME_LENGTH);
}

/**
 * Valida que el nombre del archivo sea seguro y no esté vacío.
 * @function
 * @param {string} originalName - Nombre original del archivo.
 * @returns {boolean} True si el nombre es válido, false en caso contrario.
 */
function isValidFilename(originalName) {
    const sanitizedName = sanitizeFilename(originalName);
    return sanitizedName.trim().length > 0;
}

/**
 * Valida que la extensión del archivo esté permitida.
 * @function
 * @param {string} filename - Nombre del archivo.
 * @param {string[]} allowedExtensions - Array de extensiones permitidas.
 * @returns {boolean} True si la extensión está permitida, false en caso contrario.
 */
function isValidExtension(filename, allowedExtensions) {
    const fileExtension = path.extname(filename).toLowerCase().substring(1);
    return fileExtension && allowedExtensions.includes(fileExtension);
}

/**
 * Valida que el tipo MIME del archivo esté permitido.
 * @function
 * @param {string} mimetype - Tipo MIME del archivo.
 * @param {string[]} allowedTypes - Array de tipos MIME permitidos.
 * @returns {boolean} True si el tipo MIME está permitido, false en caso contrario.
 */
function isValidMimeType(mimetype, allowedTypes) {
    return mimetype && allowedTypes.includes(mimetype);
}

/**
 * Detecta intentos de actividad maliciosa en el nombre del archivo.
 * @function
 * @param {string} filename - Nombre del archivo a validar.
 * @returns {boolean} True si se detecta actividad maliciosa, false en caso contrario.
 */
function hasMaliciousContent(filename) {
    return filename.includes(NULL_BYTE) || filename.includes(PATH_TRAVERSAL);
}

/**
 * Configura el almacenamiento de archivos usando multer.
 * @function
 * @param {string} uploadDirectory - Directorio de destino para los archivos.
 * @returns {multer.StorageEngine} Configuración de almacenamiento de multer.
 */
function configureStorage(uploadDirectory) {
    return multer.diskStorage({
        /**
         * Define el directorio de destino para los archivos subidos.
         * @function
         * @param {Express.Request} request - Objeto de solicitud de Express.
         * @param {Express.Multer.File} file - Objeto que contiene información del archivo.
         * @param {Function} callback - Función callback para continuar el proceso.
         * @returns {void}
         */
        destination: function (request, file, callback) {
            callback(null, uploadDirectory);
        },

        /**
         * Define el nombre del archivo a guardar.
         * @function
         * @param {Express.Request} request - Objeto de solicitud de Express.
         * @param {Express.Multer.File} file - Objeto que contiene información del archivo.
         * @param {Function} callback - Función callback para continuar el proceso.
         * @returns {void}
         */
        filename: function (request, file, callback) {
            const newName = generateUniqueFilename(file.fieldname, file.originalname);
            callback(null, newName);
        }
    });
}

/**
 * Crea un filtro de archivos con validaciones de seguridad mejoradas.
 * @function
 * @param {string[]} allowedTypes - Array de tipos MIME permitidos.
 * @param {string[]} allowedExtensions - Array de extensiones de archivo permitidas.
 * @returns {Function} Función de filtro para multer.
 */
function createFileFilter(allowedTypes, allowedExtensions) {
    /**
     * Filtra los archivos basado en validaciones de seguridad.
     * @function
     * @param {Express.Request} request - Objeto de solicitud de Express.
     * @param {Express.Multer.File} file - Objeto que contiene información del archivo.
     * @param {Function} callback - Función callback para continuar el proceso.
     * @returns {void}
     */
    return function (request, file, callback) {
        const originalName = file.originalname || '';

        if (!isValidFilename(originalName)) {
            return callback(new Error('Nombre de archivo inválido'));
        }

        if (!isValidExtension(originalName, allowedExtensions)) {
            return callback(new Error('Tipo de archivo no permitido'));
        }

        if (!isValidMimeType(file.mimetype, allowedTypes)) {
            return callback(new Error('Tipo MIME no permitido'));
        }

        if (hasMaliciousContent(originalName)) {
            return callback(new Error('Se ha detectado un intento de actividad maliciosa'));
        }

        callback(null, true);
    };
}

/**
 * Cuenta el total de archivos en el objeto request.files.
 * @function
 * @param {object} files - Objeto files de la request.
 * @returns {number} Número total de archivos.
 */
function countTotalFiles(files) {
    if (!files) { return 0; }

    let totalFiles = 0;
    Object.keys(files).forEach(key => {
        totalFiles += files[key].length;
    });
    return totalFiles;
}

/**
 * Crea middleware de validación para archivos únicos.
 * @function
 * @param {multer.Multer} upload - Instancia de multer configurada.
 * @param {number} maxFiles - Número máximo de archivos permitidos.
 * @returns {Function[]} Array de middlewares para validación.
 */
function createSingleValidation(upload, maxFiles) {
    /**
     * Valida archivos únicos después del procesamiento de multer.
     * @function
     * @param {string} fieldName - Nombre del campo del formulario.
     * @returns {Function[]} Array de middlewares de validación.
     */
    return function (fieldName) {
        return [
            upload.single(fieldName),
            (request, response, next) => {
                if (request.file && request.files && request.files.length > maxFiles) {
                    return next(new Error('Número máximo de archivos excedido'));
                }
                next();
            }
        ];
    };
}

/**
 * Crea middleware de validación para arrays de archivos.
 * @function
 * @param {multer.Multer} upload - Instancia de multer configurada.
 * @param {number} maxFiles - Número máximo de archivos permitidos.
 * @returns {Function} Función de validación para arrays.
 */
function createArrayValidation(upload, maxFiles) {
    /**
     * Valida arrays de archivos después del procesamiento de multer.
     * @function
     * @param {string} fieldName - Nombre del campo del formulario.
     * @param {number} maxCount - Número máximo de archivos en el array.
     * @returns {Function[]} Array de middlewares de validación.
     */
    return function (fieldName, maxCount = maxFiles) {
        const actualMaxCount = Math.min(maxCount, maxFiles);
        return [
            upload.array(fieldName, actualMaxCount),
            (request, response, next) => {
                if (request.files && request.files.length > actualMaxCount) {
                    return next(new Error('Número máximo de archivos excedido'));
                }
                next();
            }
        ];
    };
}

/**
 * Crea middleware de validación para múltiples campos de archivos.
 * @function
 * @param {multer.Multer} upload - Instancia de multer configurada.
 * @param {number} maxFiles - Número máximo de archivos permitidos.
 * @returns {Function} Función de validación para múltiples campos.
 */
function createFieldsValidation(upload, maxFiles) {
    /**
     * Valida múltiples campos de archivos después del procesamiento de multer.
     * @function
     * @param {Array} fields - Array de configuración de campos.
     * @returns {Function[]} Array de middlewares de validación.
     */
    return function (fields) {
        return [
            upload.fields(fields),
            (request, response, next) => {
                const totalFiles = countTotalFiles(request.files);
                if (totalFiles > maxFiles) {
                    return next(new Error('Número máximo de archivos excedido'));
                }
                next();
            }
        ];
    };
}

/**
 * Middleware para sanitización y gestión de subida de archivos.
 * @function
 * @param {string} uploadDirectory - Directorio donde se almacenarán los archivos.
 * @param {string[]} allowedTypes - Array de tipos MIME permitidos.
 * @param {string[]} allowedExtensions - Array de extensiones de archivo permitidas.
 * @param {number} maxSizeMb - Tamaño máximo de archivo en megabytes.
 * @param {number} maxFiles - Número máximo de archivos permitidos.
 * @returns {object} Objeto con métodos de configuración de multer.
 */
const configureUpload = (uploadDirectory, allowedTypes, allowedExtensions, maxSizeMb, maxFiles) => {
    createUploadDirectory(uploadDirectory);

    const storage = configureStorage(uploadDirectory);
    const fileFilter = createFileFilter(allowedTypes, allowedExtensions);

    const upload = multer({
        storage,
        limits: {
            fileSize: maxSizeMb * BYTES_PER_MB,
            files: maxFiles,
            fields: MAX_FORM_FIELDS,
            parts: maxFiles + MAX_FORM_FIELDS
        },
        fileFilter
    });

    return {
        single: createSingleValidation(upload, maxFiles),
        array: createArrayValidation(upload, maxFiles),
        fields: createFieldsValidation(upload, maxFiles),
        multer: upload
    };
};

module.exports = configureUpload;