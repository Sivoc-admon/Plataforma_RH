const jwt = require('jsonwebtoken');
const iam = require('../IAM.json');
const { fetchPostgREST } = require('../scripts/postgrestHelper');
const { setupTokenCookie } = require("../../controllers/login.controller")
const URL_TAG = process.env.URL_TAG;
const ERROR_MESSAGE = process.env.ERROR_MESSAGE;

/**
 * Middleware global para gestionar las sesiones
 * @params req res next
 * @returns next();
 * @throws {error} Elige entre JWT inválido o sesión erronea.
 */
const sessionManager = async (req, res, next) => {
    res.locals.URL_TAG = URL_TAG;
    res.locals.ERROR_MESSAGE = ERROR_MESSAGE;

    // Rutas de utilidades: el sistema accede a estas rutas para obtener recursos
    if (!req.url.startsWith(URL_TAG))
        return next();

    // Si no es una ruta publica, remueve la etiqueta y lee el modulo de origen y la actividad
    const reqUrl = req.url.substring(URL_TAG.length);

    // Rutas públicas: el usuario tiene permitido acceder sin importar su autenticación
    if ((["/login", "/login/postAuth", "/logout"].includes(reqUrl)))
        return next();

    // Obten las variables de la petición sin importar el estado de su sesión
    let payload = "";

    // Verifica la autenticidad del *accessToken
    try {
        const accessToken = req.cookies[process.env.AT_COOKIE_NAME];
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        payload = decoded; // case1&2 -> accessToken Working

    } catch (error) {
        // En caso de que el token no sea auténtico...
        // Consulta en la base de datos si el *refreshToken es auténtico
        const refreshToken = req.cookies[process.env.RT_COOKIE_NAME];
        const rationaleResponse = await rationaleRefreshToken(refreshToken);
        if (!rationaleResponse.success) return res.status(500).send(rationaleResponse.message);

        // Detén la petición por completo en caso que el *refreshToken sea inválido (case 3)
        if (!rationaleResponse.token) { // case3 -> both tokens are invalid
            return res.status(401).send('Tu sesión ha caducado. Por favor, inicia sesión nuevamente.');
        }

        // O en otro caso, renueva el *accessToken en caso que su token de sesión sea válido
        const isRootUser = false;
        const doRefreshToken = false; 
        const setupATresponse = setupTokenCookie(res, previousPayload, isRootUser, doRefreshToken);
        if (!setupATresponse.success) return res.status(500).send(setupATresponse.message);

        const previousPayload = {
            name: res.locals.nameDisplay || 'mockName',
            id: res.locals.userId || 'mockId',
            email: res.locals.email || 'mockEmail',
            privilegio: res.locals.privilegio || 'mockPrivilegio'
        };
        payload = previousPayload; // case4 -> reload *accessToken
    }

    // Configura las variables de la petición antes de continuar
    res.locals.nameDisplay = payload.nameDisplay;
    res.locals.userId = payload.userId;
    res.locals.email = payload.email;
    res.locals.privilegio = payload.privilegio;

    // exit
    return next();
};

/**
 * Determina si existe un token no expirado en la DB relacionado con el usuario
 * @param {string} refreshToken - El token que se consultará.
 * @returns {bool} false - Indica que se debe ejecutar /logout
 * @returns {string} newAccessToken - El string del nuevo JWT AT.
 * @throws {Error} 
 */
async function rationaleRefreshToken(refreshToken) {

    // Ejecuta el fetch SELECT user_id FROM sesion_activa WHERE token = ${refreshToken};
    const pgRestRequest = {
        fetchMethod: 'GET',
        fetchUrl: `${process.env.BACKEND_URL}/sesion_activa?select=user_id&token=eq.${refreshToken}`,
        fetchBody: {}
    }

    // Captura el error al consultar la base de datos
    const response = await fetchPostgREST(pgRestRequest);
    if (!response.ok) {
        return {
            success: false,
            message: process.env.ERROR_MESSAGE + '002',
            token: false
        };
    }

    // Debido a que el *refreshToken no es válido, regresa false
    const tokenDbData = await response.json();
    console.log("tokenDbData from rationaleRefreshToken:", tokenDbData);
    if (!tokenDbData || tokenDbData.length === 0 || tokenDbData.expiresAt < Date.now()) {
        return {
            success: true,
            message: 'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.',
            token: false
        };
    }

    // En caso contrario, regresa true indicando que se deberá generar un *accessToken
    return {
        success: true,
        message: '',
        token: newAccessToken
    };
};

module.exports = { sessionManager };