// Importar el modelo para utilizarlo
const filesModel = require("../models/files.model");


/* --- MODEL LOGIC --- */
exports.postFirstFile = async (req, res) => {
    try {
        const response = await filesModel.create(req.file); // always use await when model.action();
        res.status(200);
    } catch (error) {
        console.error(error);
        res.status(500);
    }

}

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
