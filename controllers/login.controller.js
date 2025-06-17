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
    errorMessage: process.env.ERROR_MESSAGE,
    routes: {
        dashboard: '/login/inicio'
    }
};

/**
 * Mensajes de respuesta para las operaciones de autenticación.
 */
const AUTH_MESSAGES = {
    invalidFormat: 'Formato inválido.',
    userNotFound: 'Usuario no encontrado.',
    userDeactivated: 'Usuario desactivado.',
    incorrectPassword: 'Contraseña incorrecta.',
    tokenGenerationError: 'No se pudo generar el token.',
    internalServerError: process.env.ERROR_MESSAGE,
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
        // Validar el formulario con Joi
        const { error, value } = loginSchema.validate(request.body);
        if (error) {
            const success = true;
            const authorized = false;
            return response.status(400).json(
                createResponse(success, authorized, AUTH_MESSAGES.invalidFormat)
            );
        }


        // aqui entra lo de refresh tokens

        // se le entrega un token para que funcione por 15 minutos (Token original)
        // el refresh token sirve para pedir más (Token original) sin tener que hacer login

        // cuando el usuario hace login entonces ocurre:
        // un token de 15 minutos
        // un token de 7 dias
        // otorgas el token de 15 minutos al usuario de dicha pantalla


        //es decir el refresh token es el que se guarda en las cookies con una duración prolongada y solo se utiliza para obtener access tokens. Una vez el refresh token fabrica un access token entonces ese access token se utiliza para todo lo demás ?




        const { email, password, remember } = value;


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
 * Crea una respuesta
 * @function
 * @param {boolean} success - Exitoso o no exitoso
 * @param {boolean} authorized - Autorizado o no autorizado
 * @param {string} message - Descripción del mensaje
 * @returns {Object} Objeto de la respuesta
 */
function createResponse(success, authorized, message) {
    return {
        success: success,
        authorized: authorized,
        message: message
    };
}
