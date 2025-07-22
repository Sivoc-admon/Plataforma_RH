// TO DO, debe poder otorgar el JWT solo si jwt.js coincide con el IAM.json

import jwt from 'jsonwebtoken';

/**
 * Función para generar un JWT para utilizarlo como Bearer en PostgREST.
 * @param {string} method - Indica el método para el cual se usará el JWT.
 * @returns {string} - El Json Web Token.
 */
function createJWTforMethod(method) {

    // Elige según el rol creado en PostgreSQL
    let role = "read_only_role" || "";
    switch (method) {
        case 'POST':
            role = "create_only_role";
            break;
        case 'UPDATE':
            role = "update_only_role";
            break;
        case 'DELETE':
            role = "delete_only_role";
            break;
        default:
            role = "read_only_role";
    }
    
    const payload = {
        role: role,
        aud: "postgrest"
    }

    try {
        const token = jwt.sign(payload, process.env.postgREST_jwt_secret);
        return token;
    } catch (error) {
        throw new Error(`Error al generar el JWT: ${error.message}`);
    }

}

export { createJWTforMethod };