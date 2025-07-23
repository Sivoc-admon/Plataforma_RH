const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const loginModel = require('../models/usuario.model');

/**
 * Constantes para la configuración del módulo de autenticación.
 */
const AUTH_CONFIG = {
    cookieName: process.env.COOKIE_NAME,
    rootCredentials: {
        username: process.env.ROOT_USERNAME,
        password: process.env.ROOT_PASSWORD
    },
    jwtSecret: process.env.ACCESS_TOKEN_SECRET,
    sessionLifetime: process.env.SESSION_LIFETIME,
    defaultSessionTime: '18h',
    rootSessionTime: '30min',
    //errorMessage: process.env.ERROR_MESSAGE,
    routes: {
        dashboard: '/login/inicio'
    }
};

/**
 * Mensajes de respuesta para las operaciones de autenticación.
 */
const AUTH_MESSAGES = {
    invalidFormat: 'Formato inválido: ',
    userNotFound: 'Usuario no encontrado.',
    userDeactivated: 'Usuario desactivado.',
    incorrectPassword: 'Contraseña incorrecta.',
    tokenGenerationError: 'No se pudo generar el token',
    rootTokenError: 'No se pudo generar el token raíz',
    internalServerError: 'Error interno del servidor.'
};

/**
 * Esquema de validación JOI para los datos de login.
 */
const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: true } }).required(),
    password: Joi.string().min(8).max(72).required(),
    remember: Joi.boolean().required()
});

/**
 * GET /login
 * Renderiza la página de login.
 * @function
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @returns {void}
 */
exports.getLoginView = (request, response) => {
    try {
        return response.render('login/login.ejs');
    } catch (error) {
        console.error('Error renderizando vista de login:', error);
        return response.status(500).send(AUTH_CONFIG.errorMessage);
    }
};

/**
 * GET /login/inicio
 * Renderiza la página de inicio del dashboard.
 * @function
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @returns {void}
 */
exports.getInicioView = (request, response) => {
    try {
        return response.render('login/inicio.ejs');
    } catch (error) {
        console.error('Error renderizando vista de inicio:', error);
        return response.status(500).send(AUTH_CONFIG.errorMessage);
    }
};

/**
 * POST /login/POSTAUTH
 * Autenticación de usuarios: root y base de datos.
 * @async
 * @function
 * @param {Object} request - Objeto de solicitud de Express.
 * @param {Object} response - Objeto de respuesta de Express.
 * @returns {Promise<Object>} Respuesta JSON con el resultado de la autenticación.
 */
exports.postAuthentication = async (request, response) => {
    try {
        const { error, value } = loginSchema.validate(request.body);
        
        if (error) {
            return response.status(400).json(
                createErrorResponse(AUTH_MESSAGES.invalidFormat + error.details[0].message)
            );
        }

        const { email, password, remember } = value;

        if (isRootUser(email, password)) {
            return await handleRootAuthentication(response);
        }

        const existingToken = request.cookies[AUTH_CONFIG.cookieName];
        return await handleDatabaseAuthentication(email, password, remember, existingToken, response);

    } catch (error) {
        console.error('Error en autenticación:', error);

        if (error instanceof mongoose.Error.ValidationError) {
            return response.status(400).json({
                success: true,
                authorized: false
            });
        }

        return response.status(500).json({
            success: false,
            message: AUTH_MESSAGES.internalServerError
        });
    }
};

/**
 * Verifica si las credenciales corresponden al usuario root.
 * @function
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {boolean} True si son credenciales de root, false en caso contrario.
 */
function isRootUser(email, password) {
    return email === AUTH_CONFIG.rootCredentials.username && 
           password === AUTH_CONFIG.rootCredentials.password;
}

/**
 * Genera un token JWT para el usuario root.
 * @async
 * @function
 * @returns {Promise<Object>} Objeto con el resultado de la generación del token.
 */
async function generateRootToken() {
    try {
        const tokenPayload = {
            name: 'USUARIO RAÍZ',
            userId: '000',
            email: AUTH_CONFIG.rootCredentials.username,
            privilegio: 'DIRECTIVO'
        };

        const newAccessToken = jwt.sign(
            tokenPayload,
            AUTH_CONFIG.jwtSecret,
            { expiresIn: AUTH_CONFIG.rootSessionTime }
        );

        return { 
            success: true, 
            accessToken: newAccessToken, 
            userId: '000' 
        };
    } catch (error) {
        console.error('Error generando token de root:', error);
        return { 
            success: false, 
            accessToken: '' 
        };
    }
}

/**
 * Busca un usuario en la base de datos por email.
 * @async
 * @function
 * @param {string} email - Email del usuario a buscar.
 * @returns {Promise<Object|null>} Usuario encontrado o null.
 */
async function findUserByEmail(email) {
    return await loginModel.findOne({ email });
}

/**
 * Verifica si la contraseña proporcionada coincide con la hasheada.
 * @async
 * @function
 * @param {string} plainPassword - Contraseña en texto plano.
 * @param {string} hashedPassword - Contraseña hasheada.
 * @returns {Promise<boolean>} True si coinciden, false en caso contrario.
 */
async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Genera un nuevo token JWT para un usuario autenticado.
 * @function
 * @param {Object} user - Datos del usuario.
 * @param {boolean} remember - Si recordar la sesión.
 * @returns {string} Token JWT generado.
 */
function createUserToken(user, remember) {
    const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        privilegio: user.privilegio
    };

    const expirationTime = remember ? 
        AUTH_CONFIG.sessionLifetime : 
        AUTH_CONFIG.defaultSessionTime;

    return jwt.sign(
        tokenPayload,
        AUTH_CONFIG.jwtSecret,
        { expiresIn: expirationTime }
    );
}

/**
 * Verifica si un token JWT existente es válido o genera uno nuevo.
 * @async
 * @function
 * @param {Object} user - Datos del usuario.
 * @param {boolean} remember - Si recordar la sesión.
 * @returns {Promise<Object>} Resultado de la operación con el token.
 */
async function generateTokenOnValidAuthentication(user, remember) {
    try {
        jwt.verify(existingToken, AUTH_CONFIG.jwtSecret);
        return { 
            success: true, 
            accessToken: '' 
        };
    } catch (error) {
        const tokenErrors = ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'];
        
        if (tokenErrors.includes(error.name)) {
            const newAccessToken = createUserToken(user, remember);
            return { 
                success: true, 
                accessToken: newAccessToken 
            };
        }
        
        console.error('Error verificando token:', error);
        return { 
            success: false, 
            accessToken: '' 
        };
    }
}

/**
 * Configura la cookie de autenticación en la respuesta.
 * @function
 * @param {Object} response - Objeto de respuesta de Express.
 * @param {string} token - Token JWT a establecer en la cookie.
 * @returns {void}
 */
function setAuthCookie(response, token) {
    response.cookie(AUTH_CONFIG.cookieName, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    });
}

/**
 * Crea una respuesta de éxito para autenticación autorizada.
 * @function
 * @returns {Object} Objeto de respuesta exitosa.
 */
function createSuccessResponse() {
    return {
        success: true,
        authorized: true,
        redirectUrl: AUTH_CONFIG.routes.dashboard
    };
}


/**
 * Maneja la autenticación del usuario root.
 * @async
 * @function
 * @param {Object} response - Objeto de respuesta de Express.
 * @returns {Promise<Object>} Respuesta JSON para el cliente.
 */
async function handleRootAuthentication(response) {
    const rootToken = await generateRootToken();
    
    if (!rootToken.success) {
        return response.status(500).json({
            success: false,
            message: AUTH_MESSAGES.rootTokenError
        });
    }

    setAuthCookie(response, rootToken.accessToken);
    return response.status(200).json(createSuccessResponse());
}

/**
 * Maneja la autenticación de usuarios de la base de datos.
 * @async
 * @function
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña del usuario.
 * @param {boolean} remember - Si recordar la sesión.
 * @param {string} existingToken - Token JWT existente.
 * @param {Object} response - Objeto de respuesta de Express.
 * @returns {Promise<Object>} Respuesta JSON para el cliente.
 */
async function handleDatabaseAuthentication(email, password, remember, existingToken, response) {
    const user = await findUserByEmail(email);
    
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

    return response.status(200).json(createSuccessResponse());
}