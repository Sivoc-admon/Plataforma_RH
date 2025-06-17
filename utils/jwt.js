const jwt = require('jsonwebtoken');
const iam = require('./IAM.json');

// Constantes para la mantenibilidad
const COOKIE_NAME = process.env.COOKIE_NAME;
const PUBLIC_ROUTES = ['/login', '/login/POSTAUTH', '/Unauthorized', '/logout'];
const LOGIN_ROUTES = ['/login', '/login/POSTAUTH'];
const HOME_REDIRECT = '/login/inicio';
const UNAUTHORIZED_REDIRECT = '/Unauthorized';
const LOGIN_REDIRECT = '/login';

/**
 * Middleware de autorización que permite gestionar sesiones y JWT tokens
 * 
 * @param {object} request - Express request object
 * @param {object} response - Express response object  
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authorize = (request, response, next) => {
    initializeResponseLocals(response);
    
    const token = request.cookies[COOKIE_NAME];
    const currentUrl = request.url;

    // Maneja las rutas que no requieren autenticación
    if (shouldSkipTokenValidation(token, currentUrl)) {
        return next();
    }

    // Redirige los usuarios autenticados fuera del Login
    if (shouldRedirectFromLogin(token, currentUrl)) {
        return response.redirect(HOME_REDIRECT);
    }

    // Permite que las rutas de upload funcionen si estás autenticado
    if (shouldAllowUploadsAccess(token, currentUrl)) {
        return next();
    }

    // Si todo es correcto, procesa los tokens de la sesión
    return processTokenValidation(token, request, response, next);
};

/**
 * Inicializar las variables locales según el usuario
 * @param {object} response - Express response object
 */
function initializeResponseLocals(response) {
    const defaultLocals = {
        email: '',
        privilegio: '',
    };

    // Mapea directamente las variables de response con defaultLocals 
    Object.entries(defaultLocals).forEach(
        ([key, defaultValue]) => {
        response.locals[key] = response.locals[key] || defaultValue;
    });
}

/**
 * Determina si el REFRESH_TOKEN es necesario para la ruta requerida 
 * @param {string|undefined} REFRESH_TOKEN - Token de las cookies
 * @param {string} url - URL actual de la solicitud
 * @returns {boolean} true or false
 */
function shouldSkipTokenValidation(REFRESH_TOKEN, url) {
    return !REFRESH_TOKEN && PUBLIC_ROUTES.includes(url);
}

/**
 * Determina si el usuario está autenticado para saltarse el Login
 * @param {string|undefined} token - JWT token from cookies
 * @param {string} url - Current request URL
 * @returns {boolean} true or false
 */
function shouldRedirectFromLogin(token, url) {
    return token && LOGIN_ROUTES.includes(url);
}

/**
 * Determine if uploads access should be allowed
 * @param {string|undefined} token - JWT token from cookies
 * @param {string} url - Current request URL
 * @returns {boolean} true or false
 */
function shouldAllowUploadsAccess(token, url) {
    return token && url.startsWith('/uploads/');
}

/**
 * Procesa los tokens de JWT token para autorización
 * @param {string|undefined} token - JWT token
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
function processTokenValidation(token, request, response, next) {
    try {
        const decodedToken = verifyAndDecodeToken(token);
        validateActiveUser(decodedToken.userId);
        setUserLocals(response, decodedToken);
        
        if (isLobbyOrProfileAccess(request.url)) {
            return next();
        }

        // Note: IAM permission checking is commented out in original code
        // validateUserPermissions(request.url, decodedToken.privilegio);
        
        return next();
    } catch (error) {
        return handleAuthenticationError(response, error);
    }
}

/**
 * Verify and decode JWT token
 * @param {string|undefined} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} When token is invalid or missing
 */
function verifyAndDecodeToken(token) {
    if (!token) {
        throw new Error('No authentication token provided');
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error('JWT secret not configured');
    }

    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

/**
 * Validate if user is still active in the system
 * @param {string} userId - User ID to validate
 * @throws {Error} When user is not active
 */
function validateActiveUser(userId) {
    // Note: activeUsers variable should be properly defined and imported
    // Use refresh token dude.
    if (typeof activeUsers !== 'undefined' && !activeUsers.has(userId)) {
        throw new Error('User session invalidated by administrator');
    }
}

/**
 * Set user information in response locals
 * @param {object} response - Express response object
 * @param {object} decodedToken - Decoded JWT payload
 */
function setUserLocals(response, decodedToken) {
    response.locals.email = decodedToken.email || '';
    response.locals.privilegio = decodedToken.privilegio || '';
}

/**
 * Validar que el privilegio que tiene el usuario tenga permiso para dicha vista
 * @param {string} url - Request URL
 * @param {string} userPrivilege - User privilege level
 * @throws {Error} When user lacks required permissions
 */
function validateUserPermissions(url, userPrivilege) {
    const urlParts = url.split('/').filter(part => part);
    const originModule = urlParts[0] || '';
    const actionToExecute = urlParts[1] || '';
    
    const permissionPath = iam?.[userPrivilege]?.[originModule]?.[actionToExecute];
    
    if (!permissionPath) {
        throw new Error('Insufficient permissions for requested action');
    }
}

/**
 * Handle authentication errors by clearing cookies and redirecting
 * @param {object} response - Express response object
 * @param {Error} error - Authentication error
 * @returns {void}
 */
function handleAuthenticationError(response, error) {
    // Log error for debugging (consider using proper logging service)
    console.error('Authentication failed:', error.message);
    
    response.clearCookie(COOKIE_NAME);
    return response.redirect(LOGIN_REDIRECT);
}

module.exports = { authorize };