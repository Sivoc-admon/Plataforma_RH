const jwt = require('jsonwebtoken');
const iam = require('../IAM.json');
const { fetchPostgREST } = require('../scripts/postgrestHelper');
const { setupTokenCookie } = require("../../controllers/login.controller")
const URL_TAG = process.env.URL_TAG;
const ERROR_MESSAGE = process.env.ERROR_MESSAGE;

/**
 * Middleware para otorgar RBAC a toda la aplicación.
 * @params req res next
 * @returns next();
 * @throws {error} Elige entre JWT inválido o sesión erronea.
 */
const rbacMiddleware = async (req, res, next) => {
    // Default value of local session variables
    // res.locals.userId = res.locals.userId || '';
    // res.locals.userName = res.locals.userName || '';
    // res.locals.userPhoto = res.locals.userPhoto || '';
    // res.locals.userPrivilege = res.locals.userPrivilege || '';
    // res.locals.userArea = res.locals.userArea || '';
    res.locals.URL_TAG = URL_TAG;
    res.locals.ERROR_MESSAGE = ERROR_MESSAGE;

    console.log("req.url: ", req.url);

    // Rutas de utilidades: el sistema accede a estas rutas para obtener recursos
    if (!req.url.startsWith(URL_TAG))
        return next();

    // Si no es una ruta publica, remueve la etiqueta y lee el modulo de origen y la actividad
    const reqUrl = req.url.substring(URL_TAG.length);

    // Rutas públicas: el usuario tiene permitido acceder sin importar su autenticación
    console.log("dectecting url for public as: ", reqUrl)
    if ((["/login", "/login/postAuth", "/logout"].includes(reqUrl)))
        return next();

    // Decodificar JWT: Racionaliza el acceso de los tokens
    let payload = "";
    try {
        const accessToken = req.cookies[process.env.AT_COOKIE_NAME];
        console.log("Current AT: ", accessToken);
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        payload = decoded;
    } catch (error) {
        const refreshToken = req.cookies[process.env.RT_COOKIE_NAME];
        console.log("Current RT: ", refreshToken);
        const rationaleResponse = await rationaleRefreshToken(refreshToken);
        console.log("New RT: ", newAccessToken);
        if (!rationaleResponse.isTokenValid) return res.redirect(`${URL_TAG}/logout`);

        // TO DO, también hay que corriger la propia función setupTokenCookie
        // Darles responses y así
        const userData = {
            nameDisplay: res.locals.nameDisplay,
            userId: res.locals.userId,
            email: res.locals.email,
            privilegio: res.locals.privilegio,
        };
        const isRootUser = false;
        const doRefreshToken = false;
        const response = setupTokenCookie(res, userData, isRootUser, doRefreshToken);
        // catch that error and then continue with rbac logic
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

/**
 * Determina si existe un token no expirado en la DB relacionado con el usuario
 * @param {string} refreshToken - El token que se consultará.
 * @returns {bool} false - Indica que se debe ejecutar /logout
 * @returns {string} newAccessToken - El string del nuevo JWT AT.
 * @throws {Error} 
 */
async function rationaleRefreshToken(refreshToken) {
    if (!refreshToken) { // ERROR, NO PUEDES DECIR QUE NO TIENE RT
        // pero si no lo tiene significa que no existe la sesión
        // pero que pasa si si existe?
        // ese valor solo se encuentra en res.locals
        // alguna otra versión más segura?
        // si tiene ambas cookies empty entonces redirigelo pero a /LOGIN
        return false; // -> '/logout'
    }

    // Ejecuta el fetch SELECT user_id FROM sesion_activa WHERE token = ${refreshToken};
    const fetchMethod = 'GET';
    const fetchUrl = `${process.env.BACKEND_URL}/sesion_activa?select=user_id&token=eq.${refreshToken}`;
    const fetchBody = {};
    const response = await fetchPostgREST(fetchMethod, fetchUrl, fetchBody);
    if (!response.ok) {
        return {
            success: false,
            message: process.env.ERROR_MESSAGE + '002',
            isTokenValid: false
        };
    }

    // if response -> data -> .length === 0, return false; // -> '/logout'
    console.log("response from PostgREST 02: ", response);
    const tokenDbData = await response.json();
    console.log("tokenDbData from postgREST: ", tokenDbData);

    // Si el tokenDbData tiene una fecha más grande entonces ejecuta logOut
    if (tokenDbData.expiresAt < Date.now()) {
        return false; // -> '/logout' (logout deletes RT from database)
    }

    // Crea el accesToken de ese user id
    const newAccessToken = jwt.sign({ id: tokenDbData.user_id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });

    console.log("newAccessToken from fetchRT_helper: ", newAccessToken);
    return newAccessToken;

};

module.exports = { rbacMiddleware };
