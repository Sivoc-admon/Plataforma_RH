const jwt = require('jsonwebtoken');
const iam = require('../IAM.json');

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

    // Rutas públicas: el usuario tiene permitido acceder sin importar su autenticación
    if ((["/login", "/login/postAuth", "/notFound", "/logout", "/inicio"].includes(req.url)))
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
            return res.redirect("/logout");
        }
        res.cookie(process.env.AT_COOKIE_NAME, newAccessToken, { // Refresca el accessToken
            httpOnly: true,
            secure: process.env.ENV_TYPE === 'production', // Solo HTTPS en producción
            sameSite: 'strict',
            maxAge: parseFloat(process.env.ACCESS_TOKEN_EXPIRATION.slice(0, -1)) * 24 * 60 * 60 * 1000,
        });
    }

    // RBAC Business Logic: Identifica si el usuario tiene permisos, sino, solo informalo.
    const authorized = rbacBusinessLogic(req.url, payload);
    if (!authorized) {
        return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes.' });
    }

    // El usuario tiene permisos para continuar ejecutando la petición.
    return next();
};

/**
 * Ejecuta la lógica de negocio para acceso basado en roles.
 * Solo se puede ejectuar esta lógica si ya fue racionalizada la sesión.
 * @param {string} reqUrl - La url que está manejando.
 * @param {json} decoded - El payload del JWT decodificado.
 * @returns {???} 
 * @throws {Error} Si los parámetros no son números válidos.
 */
function rbacBusinessLogic(reqUrl, decoded) {
    // aqui ya verificaste los accesos, ya se solucionaron los refreshes y los logouts

    // Res.locals: Se debe actualizar la meta-data de la sesión activa
    //res.locals.userName = decoded.name;
    //res.locals.userPhoto = decoded.foto.replace("public", ""); // uploads . usuarios
    //res.locals.userPrivilege = decoded.privilegio;
    //res.locals.userArea = decoded.area;
    //res.locals.userId = decoded.userId;

    // Rutas semi-públicas: el usuario accede sin necesidad de IAM.json, solo login
    const rutasSemipublicas = ['/uploads', '/inicio', '/myUserView'];
    if (rutasSemipublicas.some(path => reqUrl.startsWith(path))) {
        return true; // -> next();
    }

    // Particiones del URL: filtra el acceso por módulo, y luego por acción
    const urlParts = req.url.split('/').filter(part => part);
    const originModule = urlParts[0] || '';
    const actionToExecute = urlParts[1] || '';
    const privilege = decoded.privilegio;
    const permissionPath = iam?.[privilege]?.[originModule]?.[actionToExecute];

    console.log("originModule : " + originModule);
    console.log("privilege : " + privilege);
    console.log("actionToExecute : " + actionToExecute);
    console.log("permissionPath: " + permissionPath);

    if (!permissionPath)
        return false; // -> "not next();" 

    // Rutas protegidas: el usuario tiene permitido acceder solo si IAM.json acepta el URL



    // yo creo que lo más sencillo sería, un json por tipo de rol
    // y que su body pues sea: 
    /*
    {
    "DIRECTIVO": {
        "/usuarios/usersView/singleUserView/patchUser/datoLaboral": true,
        "/usuarios/usersView/unactiveUsersView/singleUserView": true,
    }
    */
    // ten la lista completa de URLs para todos los roles, recuerda que deben existir los switches





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
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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
        console.log(process.env.ERROR_MESSAGE, "003")
    }
};

module.exports = { rbacMiddleware };
