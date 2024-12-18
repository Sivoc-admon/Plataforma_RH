// Importar el modelo para utilizarlo
// const xxx = require('../models/usuarios.model.js');


/* --- MODEL LOGIC --- */



/* --- VIEWS LOGIC --- */

// Renderizar página de inicio (homepage)
exports.getUsersView = (req, res) => {
    try {
        res.render('usuarios/usuarios.ejs');
    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};
