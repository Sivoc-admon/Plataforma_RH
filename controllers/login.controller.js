const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { fetchPostgREST } = require('../utils/scripts/postgrestHelper');

/**
 * Constantes para la configuración del módulo de autenticación.
 */
const ERROR_MESSAGE = process.env.ERROR_MESSAGE;
const ROOT_USERNAME = process.env.ROOT_USERNAME;
const ROOT_PASSWORD = process.env.ROOT_PASSWORD;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION;
const AT_COOKIE_NAME = process.env.AT_COOKIE_NAME;

const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION;
const RT_COOKIE_NAME = process.env.RT_COOKIE_NAME;

const NODE_ENV = process.env.NODE_ENV;
const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Controla la creación de una sesión a través del LogIn en "public/login.js"
 * @async /login/postAuth
 * @function
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise<Object>} Respuesta JSON con el resultado de la autenticación.
 * @returns false = Se mostrará al usuario el campo Promise<Object>.message
 * @returns true = Se redirecionará el usuario a "/inicio"
 */
async function postAuthentication(req, res) {
    try {
        const { email, password, remember } = req.body;
        const doRefreshToken = true;

        // 1. isRootValid: Si el usuario ingresa como usuario raíz, otorga un solo *accessToken 
        const isRootValid = email === ROOT_USERNAME && await bcrypt.compare(password, ROOT_PASSWORD);
        if (isRootValid) {
            const tokenResponse = await setupTokenCookie(res, null, isRootValid, !doRefreshToken);
            if (!tokenResponse.success) return res.status(200).json({ success: true, message: tokenResponse.message });
            return res.status(200).json({ success: true });
        }

        // 2. isUserValid: Si el usuario ingresa un usuario incorrecto, indicalo
        const userValid = await isUserValid(email, password);
        if (!userValid.success) return res.status(200).json({ success: false, message: userValid.message });

        // 3. setupTokenCookie: Crea los tokens y las cookies de la sesión recién verificada
        const AT_response = await setupTokenCookie(res, userValid.data, isRootValid, !doRefreshToken);
        if (!AT_response.success) return res.status(200).json({ success: false, message: AT_response.message });

        if (remember) { // Crea una sesión larga solo si el usuario pide que lo recuerden
            const RF_response = await setupTokenCookie(res, userValid.data, isRootValid, doRefreshToken);
            if (!RF_response.success) return res.status(200).json({ success: false, message: RF_response.message });
        }

        // exit
        return res.status(200).json({ success: true, message: '' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: (ERROR_MESSAGE + '003'),
        });
    }
};

/**
 * Función para verficiar si un usuario es válido para crear una sesión
 * @async
 * @function
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<Object>} - Objeto JSON indicando success si es válido
 */
async function isUserValid(email, password) {
    // Ejecuta el fetch de la información del usuario
    const pgRestRequest = {
        fetchMethod: 'GET',
        fetchUrl: `${BACKEND_URL}/usuario?select=id,privilegio,password,habilitado,email&email=eq.${email}`,
        fetchBody: {}
    }

    // Captura el error al consultar la base de datos
    const response = await fetchPostgREST(pgRestRequest);
    if (!response.ok) {
        return {
            success: false,
            message: process.env.ERROR_MESSAGE + '006'
        };
    }

    const userDbData = await response.json();

    // Determina si el usuario existe, si está activo, y si tiene credenciales correctas
    if (userDbData.length === 0) {
        return {
            success: false,
            message: 'El usuario no fue encontrado'
        }
    }
    const userJson = userDbData[0]; // Consigue el objeto del usuario
    if (!userJson.habilitado) {
        return {
            success: false,
            message: 'El usuario no se encuentra habilitado para iniciar sesión'
        }
    }
    const isPasswordValid = await bcrypt.compare(password, userJson.password);
    if (!isPasswordValid) {
        return {
            success: false,
            message: 'La contraseña es incorrecta'
        }
    }

    // Si la información ingresada es válida, otorga la información para generar tokens
    return {
        success: true,
        message: '',
        data: userJson
    };
};

/**
 * Función para CREAR una sola cookie (y/o token) de la sesión recién verificada 
 * TO DO
 * @async
 * @function
 * @param {object} res - Objeto de respuesta de Express.
 * @param {object} userData - El JSON del usuario con la información de la DB
 * @param {bool} isRootUser - Indica si el accessToken es para el usuario raíz
 * @param {bool} doRefreshToken - Indica si se requiere de un refresh token
 * @returns {bool} - Boolean que indica true si la operación fue exitosa
 */
async function setupTokenCookie(res, userData, isRootUser, doRefreshToken) {

    // Elige el payload correcto según si el usuario es el RootUser o un usuario común
    const userPayload = isRootUser
        ? { nameDisplay: 'Usuario Raíz', userId: '000', email: ROOT_USERNAME, privilegio: 'DIRECTIVO' }
        : { nameDisplay: '(mock)userData.name', userId: userData.id, email: userData.email, privilegio: userData.privilegio };

    // Elige si la cookie será para un *refreshToken o un *accessToken (newToken, maxAge, cookieName)
    const newToken = doRefreshToken //newToken
        ? require('crypto').randomBytes(64).toString('hex') // Utiliza hexadecimal para refresh
        : jwt.sign(userPayload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
    const maxAge = doRefreshToken //maxAge
        ? parseFloat(REFRESH_TOKEN_EXPIRATION.slice(0, -1)) * 24 * 60 * 60 * 1000
        : parseFloat(ACCESS_TOKEN_EXPIRATION.slice(0, -1)) * 24 * 60 * 60 * 1000;
    const cookieName = doRefreshToken //cookieName
        ? RT_COOKIE_NAME
        : AT_COOKIE_NAME;

    // Envia al navegador la cookie
    res.cookie(cookieName, newToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'strict',
        maxAge: maxAge,
    });

    // Si el token es *refreshToken entonces también añadelo a la base de datos (sesion_activa)
    if (doRefreshToken) {

        // Ejecuta el fetch SELECT user_id FROM sesion_activa WHERE token = ${refreshToken};
        const expires_at = new Date(Date.now() + maxAge);
        const pgRestRequest = {
            fetchMethod: 'POST',
            fetchUrl: `${BACKEND_URL}/sesion_activa`,
            fetchBody: {
                user_id: userData.id,
                token: newToken,
                expires_at: expires_at
            }
        }

        // Captura el error al consultar la base de datos
        const response = await fetchPostgREST(pgRestRequest);
        if (!response.ok) {
            return {
                success: false,
                message: process.env.ERROR_MESSAGE + '004',
            };
        }
    }

    // exit
    return {
        success: true,
        message: ''
    }
}


/**
 * Remueve las cookies y también remueve la sesión de la base de datos
 * @async /logout
 * @function
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise<Object>} Respuesta JSON.
 */

async function doLogout(req, res) {
    // Ejecuta el fetch para borrar la sesión del usuario
    const user_id = res.locals.userId;
    const pgRestRequest = {
        fetchMethod: 'DELETE',
        fetchUrl: `${BACKEND_URL}/sesion_activa`,
        fetchBody: { user_id: user_id }
    }

    // Captura el error al consultar la base de datos
    const response = await fetchPostgREST(pgRestRequest);
    if (!response.ok) {
        return {
            success: false,
            message: process.env.ERROR_MESSAGE + '005'
        };
    }

    // Finaliza la petición borrando las cookies y redirige al usuario a '/login'
    res.clearCookie(process.env.AT_COOKIE_NAME);
    res.clearCookie(process.env.RT_COOKIE_NAME);
    return res.redirect(`${process.env.URL_TAG}/login`);
}

module.exports = { postAuthentication, doLogout, setupTokenCookie };