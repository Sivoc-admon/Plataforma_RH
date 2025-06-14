const mongoSanitize = require('mongo-sanitize');


/**
 * Middleware global para sanitización automática de todo los inputs hacia MongoDB
 *
 * @param {object} request - Objeto de solicitud
 * @param {object} response - Objeto de respuesta
 * @param {Function} next - Función para continuar con el siguiente middleware
 */
const sanitizeInputs = (request, response, next) => {
    if (request.body && Object.keys(request.body).length > 0) {
        request.body = JSON.parse(
            JSON.stringify(request.body), (aux, value) => mongoSanitize(value));}

    if (request.params && Object.keys(request.params).length > 0) {
        request.params = JSON.parse(
            JSON.stringify(request.params), (aux, value) => mongoSanitize(value));
    }

    if (request.query && Object.keys(request.query).length > 0){
        request.query = JSON.parse(
            JSON.stringify(request.query), (aux, value) => mongoSanitize(value));
    }
    next();
};

module.exports = { sanitizeInputs };