// Importar el modelo para utilizarlo
// const xxx = require('../models/usuarios.model.js');


/* --- MODEL LOGIC --- */



/* --- VIEWS LOGIC --- */
/**
 * Renderizar la página principal de Vacaciones (En construcción)
 *
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 */
exports.getVacationsView = (request, response) => {
    try {
        response.render('vacaciones/vacaciones.ejs');
    } catch (error) {
        console.error(error);
        response.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};
