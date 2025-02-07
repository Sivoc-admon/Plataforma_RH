const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📌 Función para configurar el middleware de subida con `uploadDir` y `allowedTypes` personalizados
const configureUpload = (uploadDir, allowedTypes) => {
    // 📌 Verifica y crea la carpeta si no existe
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 📌 Configuración del almacenamiento
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

    // 📌 Filtro de archivos permitidos
    const fileFilter = (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${allowedTypes.join(", ")}`));
        }
    };

    // 📌 Middleware `upload` con límites y validación de tipo de archivo
    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
        fileFilter
    });
};

// 📌 Exportar la función de configuración
module.exports = configureUpload;