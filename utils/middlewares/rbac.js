const jwt = require('jsonwebtoken');
const iam = require('../IAM.json');
const { createJWTforMethod } = require('../scripts/postgrestHelper');

// separa tus rutas con la etiqueta /api/ al inicio.
const URL_TAG = process.env.URL_TAG; // `${URL_TAG}/login`

/**
 * Middleware para otorgar RBAC a toda la aplicación.
 * @params req res next
 * @returns next();
 * @throws {error} Elige entre JWT inválido o sesión erronea.
 */
const rbacMiddleware = (req, res, next) => {
    // Default value of local session variables
    // res.locals.userId = res.locals.userId || '';
    // res.locals.userName = res.locals.userName || '';
    // res.locals.userPhoto = res.locals.userPhoto || '';
    // res.locals.userPrivilege = res.locals.userPrivilege || '';
    // res.locals.userArea = res.locals.userArea || '';

    console.log("req.url: ", req.url);

    // Rutas de utilidades: el sistema accede a estas rutas para obtener recursos
    if (!req.url.startsWith(URL_TAG))
        return next();

    // si no es una ruta publica, remueve la etiqueta y lee el modulo de origen y la actividad
    const reqUrl = req.url.substring(URL_TAG.length);

    // Rutas públicas: el usuario tiene permitido acceder sin importar su autenticación
    if ((["/login", "/login/postAuth", "/logout", "/inicio"].includes(reqUrl)))
        return next();

    // Decodificar JWT: Racionaliza el acceso de los tokens
    let payload = "";
    try {
        const accessToken = req.cookies[process.env.AT_COOKIE_NAME];
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        payload = decoded;
    } catch (error) {
        const refreshToken = req.cookies[process.env.RT_COOKIE_NAME];
        const newAccessToken = RT_helper(refreshToken); // PostgREST parametriza la consulta
        if (!newAccessToken) {
            return res.redirect(`${URL_TAG}/logout`);
        }
        res.cookie(process.env.AT_COOKIE_NAME, newAccessToken, { // Refresca el accessToken
            httpOnly: true,
            secure: process.env.ENV_TYPE === 'production', // Solo HTTPS en producción
            sameSite: 'strict',
            maxAge: parseFloat(process.env.ACCESS_TOKEN_EXPIRATION.slice(0, -1)) * 24 * 60 * 60 * 1000,
        });
    }

    // RBAC Business Logic: Identifica si el usuario tiene permisos, sino, solo informalo.
    const authorized = rbacBusinessLogic(reqUrl, payload);
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
 * @param {string} reqUrl - La url que está manejando.
 * @param {json} decoded - El payload del JWT decodificado.
 * @returns {???} 
 * @throws {Error} Si los parámetros no son números válidos.
 */
function rbacBusinessLogic(reqUrl, decoded) {

    // (TO DO) Res.locals: Se debe actualizar la meta-data de la sesión activa
    //res.locals.userName = decoded.name;
    //res.locals.userPhoto = decoded.foto.replace("public", ""); // uploads . usuarios
    //res.locals.userPrivilege = decoded.privilegio;
    //res.locals.userArea = decoded.area;
    //res.locals.userId = decoded.userId;

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
 * Revisa y determina asíncronamente el RefreshToken dentro de PostgreSQL.
 * @param {string} refreshToken - El token que se consultará.
 * @returns {bool} false - Indica que se debe ejecutar /logout
 * @returns {string} newAccessToken - El string del nuevo JWT AT.
 * @throws {Error} 
 */
async function RT_helper(refreshToken) {
    try {
        if (!refreshToken) {
            return false; // -> '/logout'
        }
        const url = `${process.env.BACKEND_URL}/sesion_activa?select=user_id&token=eq.${refreshToken}`;
        const httpMethod = 'GET';
        const bearerToken = createJWTforMethod(httpMethod);
        const response = await fetch(url, {
            method: httpMethod,
            headers: {
                'Authorization': 'Bearer ' + bearerToken,
            }
        });
        console.log("response from PostgREST: ", response);
        if (!response) {
            return false; // -> '/logout'
        }
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

    } catch (error) {
        console.log(process.env.ERROR_MESSAGE, "002")
    }
};

module.exports = { rbacMiddleware };
