// Importar el modelo para utilizarlo
const filesModel = require("../models/files.model");


/* --- MODEL LOGIC --- */
exports.postFirstFile = async (req, res) => {
    try {
        // Verifica si el archivo está presente
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se subió ningún archivo.' });
        }

        // Guarda el archivo en la base de datos
        const response = await filesModel.create(req.file); // Suponiendo que `filesModel.create()` guarda el archivo en la base de datos

        // Envía la respuesta
        res.status(200).json({
            success: true,
            message: 'Archivo guardado con éxito',
            response: response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Algo salió mal. Favor de contactar a soporte técnico.'
        });
    }
};


/* --- VIEWS LOGIC --- */

// Renderizar página de inicio (homepage)
exports.getPermitsView = (req, res) => {
    try {
        res.render('permisos/permisos.ejs');
    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};
