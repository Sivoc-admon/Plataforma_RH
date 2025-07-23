const jwt = require('jsonwebtoken');

/**
 * Función para generar un JWT para utilizarlo como Bearer en PostgREST.
 * @param {string} method - Indica el método para el cual se usará el JWT.
 * @returns {string} - El Json Web Token.
 * @returns {bool} false - Regresa false en caso de fallar la ejecución.
 */
function createJWTforMethod(method) {

    // Elige el rol según el método HTTP, por defecto está READ.
    const roleMapping = {
        'POST': 'create_only_role',
        'GET': 'read_only_role',
        'UPDATE': 'update_only_role',
        'DELETE': 'delete_only_role',
    };
    const role = roleMapping[method] || 'read_only_role';

    // Crea el token y enviaselo a la petición
    try {
        const payload = {
            role: role,
            aud: "postgrest"
        }
        const token = jwt.sign(payload, process.env.POSTGREST_JWT);
        return token; // token
    } catch (error) {
        console.log(process.env.ERRROR_MESSAGE, "003");
    }

    // Si la generación del Token falló, entonces regresa false
    return false;
}

module.exports = {
  createJWTforMethod,
};
