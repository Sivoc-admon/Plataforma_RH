// 
/**
 * Renderiza la página principal de cursos (En construcción)
 * 
 * @param {object} request - Objeto de solicitud
 * @param {object} response - Objeto de respuesta
 */
exports.getCoursesView = (request, response) => {
    try {
        response.render('cursos/cursos.ejs');
    } catch (error) {
        console.error(error);
        response.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};
