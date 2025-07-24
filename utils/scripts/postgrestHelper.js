const jwt = require('jsonwebtoken');

// TO DO, remover el body cuando es un método GET

/**
 * Función para hacer fetch por completo a postgREST de manera segura.
 * @async
 * @param {string} fetchMethod - Indica el método para el cual se usará el JWT.
 * @param {string} fetchUrl - Indica el url que se consultará en postgREST.
 * @param {object} fetchBody - Indica el cuerpo de la petición en formato JSON.
 * @returns {object} response - El objeto de la respuesta del fetch.
 */
async function fetchPostgREST(fetchMethod, fetchUrl, fetchBody) {
    // Genera el Bearer token para autorizar la consulta a postgREST
    const roleMapping = {
        'POST': 'create_only_role',
        'GET': 'read_only_role',
        'UPDATE': 'update_only_role',
        'DELETE': 'delete_only_role',
    };
    const role = roleMapping[fetchMethod] || 'read_only_role';
    const bearerToken = jwt.sign({ role: role, aud: 'postgrest' }, process.env.POSTGREST_JWT);

    // Ejecuta la petición HTTP según los parámetros recibidos
    const response = await fetch(fetchUrl, {
        method: fetchMethod,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
        },
        // Solo se incluye el body si el método no es GET
        ...(fetchMethod !== 'GET' && { body: fetchBody }),
    });
    return response;
}

module.exports = {
    fetchPostgREST,
};
