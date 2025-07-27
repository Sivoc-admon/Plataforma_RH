const jwt = require('jsonwebtoken');
const iam = require('../IAM.json');
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

    console.log("req.url: ", req.url);

    // Rutas de utilidades: el sistema accede a estas rutas para obtener recursos
    if (!req.url.startsWith(URL_TAG))
        return next();

    // Si no es una ruta publica, remueve la etiqueta y lee el modulo de origen y la actividad
    const reqUrl = req.url.substring(URL_TAG.length);

    // Rutas públicas: el usuario tiene permitido acceder sin importar su autenticación
    if ((["/login", "/login/postAuth", "/logout"].includes(reqUrl)))
        return next();

    // Rutas privadas: el usuario solo tiene permitido continuar si tiene una sesión válida

    // Verifica la autenticidad del *accessToken
    let payload = "";
    try {
        const accessToken = req.cookies[process.env.AT_COOKIE_NAME];
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        payload = decoded;

        // En caso de que el token no sea auténtico...
        // Consulta en la base de datos si el *refreshToken es auténtico
    } catch (error) {
        const refreshToken = req.cookies[process.env.RT_COOKIE_NAME];
        const rationaleResponse = await rationaleRefreshToken(refreshToken);
        
        if (!rationaleResponse.isTokenValid) {
            return res.status(401).send('Tu sesión ha caducado. Por favor, inicia sesión nuevamente.');
        }


        const userData = {
            nameDisplay: res.locals.nameDisplay,
            userId: res.locals.userId,
            email: res.locals.email,
            privilegio: res.locals.privilegio,
        };
        const isRootUser = false;
        const doRefreshToken = false;
        const response = setupTokenCookie(res, userData, isRootUser, doRefreshToken);
    }

    // RBAC Business Logic: Identifica si el usuario tiene permisos, sino, solo informalo.
    const authorized = rbacBusinessLogic(res, reqUrl, payload);
    if (!authorized) {
        return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes.' });
    }

    // El usuario tiene permisos para continuar ejecutando la petición.
    return next();
};

/**
 * Ejecuta la lógica de negocio para acceso basado en roles.
 * Ya se verificó el acceso, el refresh y el logout. Ahora se verifican los permisos.
 * Solo se puede ejectuar esta lógica si ya fue racionalizada la sesión.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {string} reqUrl - La url que está manejando.
 * @param {json} decoded - El payload del JWT decodificado.
 * @returns {bool} - Indica si existen suficentes permisos o no.
 * @throws {Error} Si los parámetros no son números válidos.
 */
function rbacBusinessLogic(res, reqUrl, decoded) {

    // Res.locals: Se debe actualizar la meta-data de la sesión activa
    res.locals.nameDisplay = decoded.nameDisplay;
    res.locals.privilegio = decoded.privilegio;
    res.locals.email = decoded.email;
    res.locals.userId = decoded.userId;

    // Rutas semi-públicas: el usuario accede sin necesidad de IAM.json, solo login
    if ((['/inicio', '/myUserView'].includes(reqUrl)))
        return true; // -> next();

    // Rutas protegidas: el usuario tiene permitido acceder solo si IAM.json acepta el URL
    const originModule = reqUrl.split('/').filter(part => part)[1] || ''; // Obtiene el módulo
    const privilege = decoded.privilegio;
    console.log("originModule : " + originModule);
    console.log("privilege : " + privilege);
    if (reqUrl && iam.privilege.originModule[reqUrl] === true) {
        return true; // -> next();
    }

    // El usuario no tiene permisos ejecutar la petición.
    return false; // -> "not next();" 
};

module.exports = { sessionManager };
