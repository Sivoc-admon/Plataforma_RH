// Importar el modelo para utilizarlo
const filesModel = require("../models/files.model");
const permitsModel = require("../models/permisos.model");



/* --- VIEWS LOGIC --- */

// Renderizar página de inicio (homepage)
exports.colaboradorPermitsView = async (req, res) => {
    try {
        const permitsRows = await permitsModel.find({ userId: res.locals.userId }).select('-__v');
        return res.render('permisos/colaboradorPermitsView.ejs', { permitsRows });

    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};
