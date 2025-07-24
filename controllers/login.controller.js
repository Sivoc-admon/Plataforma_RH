const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { fetchPostgREST } = require('../utils/scripts/postgrestHelper');


// Debido a que /login es el unico que otorga Cookies y REFRESH tokens
// no es necesario modificar nada al rbac.js, porque simplemente no otorgas el REFRESH TOKEN y listin listón

/**
 * Constantes para la configuración del módulo de autenticación.
 */
const ERROR_MESSAGE = process.env.ERROR_MESSAGE;
const ROOT_USERNAME = process.env.ROOT_USERNAME;
const ROOT_PASSWORD = process.env.ROOT_PASSWORD;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION;
const AT_COOKIE_NAME = process.env.AT_COOKIE_NAME;

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION;
const RT_COOKIE_NAME = process.env.RT_COOKIE_NAME;

const NODE_ENV = process.env.NODE_ENV;
const BACKEND_URL = process.env.BACKEND_URL;

/**
 * POST /login/POSTAUTH
 * Otorga las cookies y crea la sesión activa en la base de datos.
 * @async
 * @function
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise<Object>} Respuesta JSON con el resultado de la autenticación.
 */
async function postAuthentication(req, res) {
    try {
        const { email, password, remember } = req.body;

        // 1. isRootValid: Si el usuario ingresa como usuario raíz, otorga un solo access token 
        const isRootValid = email === ROOT_USERNAME && bcrypt.compare(password, ROOT_PASSWORD);
        if (isRootValid) {
            const newAccessToken = jwt.sign({
                nameDisplay: 'Usuario Raíz', userId: '000', email: ROOT_USERNAME,
                privilegio: 'DIRECTIVO'
            },
                ACCESS_TOKEN_SECRET,
                { expiresIn: ACCESS_TOKEN_EXPIRATION });

            res.cookie(AT_COOKIE_NAME, newAccessToken, {
                httpOnly: true,
                secure: NODE_ENV === 'production', // Solo HTTPS en producción
                sameSite: 'strict',
                maxAge: parseFloat(ACCESS_TOKEN_EXPIRATION.slice(0, -1)) * 24 * 60 * 60 * 1000,
            });
            return res.status(200).json({ success: true });
        }

        // 2. isUserValid: Si el usuario ingresa un usuario válido, crea su sesión por completo
        const session = await isUserValid(email, password, remember);
        // logic
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error();
        return res.status(500).json({
            success: false,
            message: 'Error en autenticación:',
            error: error,
        });
    }
};

/**
 * 
 * @async
 * @function
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña del usuario.
 * @param {boolean} remember - Si recordar la sesión.
 * @returns {Promise<Object>} - Objeto JSON (AccessToken or False)
 */
async function isUserValid(email, password, remember) {

    // SELECT id, privilegio, password FROM usuario WHERE email = ${ email };
    const fetchUrl = `${process.env.BACKEND_URL}/usuario?select=id,privilegio,password&email=eq.${email}`;
    const fetchMethod = 'GET';
    const fetchBody = {};

    // Ejecuta el fetch
    const response = await fetchPostgREST(fetchMethod, fetchUrl, fetchBody);
    console.log("response from PostgREST 01: ", response);
    const data = await response.json();
    console.log("data from PostgREST: ", data);

    return true;

    if (!user) {
        return response.status(401).json(
            createErrorResponse(AUTH_MESSAGES.userNotFound)
        );
    }

    if (!user.estaActivo) {
        return response.status(401).json(
            createErrorResponse(AUTH_MESSAGES.userDeactivated)
        );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
        return response.status(401).json(
            createErrorResponse(AUTH_MESSAGES.incorrectPassword)
        );
    }

    const tokenResponse = await generateTokenOnValidAuthentication(user, existingToken, remember);
    if (!tokenResponse.success) {
        return response.status(500).json({
            success: false,
            message: AUTH_MESSAGES.tokenGenerationError
        });
    }

    if (tokenResponse.accessToken !== '') {
        setAuthCookie(response, tokenResponse.accessToken);
    }

    return false;
}

module.exports = { postAuthentication };