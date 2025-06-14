const jwt = require('jsonwebtoken');
const iam = require('./IAM.json');

// Constants for better maintainability
const COOKIE_NAME = process.env.COOKIE_NAME;
const PUBLIC_ROUTES = ['/login', '/login/POSTAUTH', '/Unauthorized', '/logout'];
const LOGIN_ROUTES = ['/login', '/login/POSTAUTH'];
const HOME_REDIRECT = '/login/inicio';
const UNAUTHORIZED_REDIRECT = '/Unauthorized';
const LOGIN_REDIRECT = '/login';

/**
 * Authorization middleware that validates JWT tokens and manages user sessions
 * @param {object} request - Express request object
 * @param {object} response - Express response object  
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authorize = (request, response, next) => {
    initializeResponseLocals(response);
    
    const token = request.cookies[COOKIE_NAME];
    const currentUrl = request.url;

    // Handle public routes without token requirement
    if (shouldSkipTokenValidation(token, currentUrl)) {
        return next();
    }

    // Redirect authenticated users away from login pages
    if (shouldRedirectFromLogin(token, currentUrl)) {
        return response.redirect(HOME_REDIRECT);
    }

    // Allow access to upload routes for authenticated users
    if (shouldAllowUploadsAccess(token, currentUrl)) {
        return next();
    }

    // Validate token and process authorization
    return processTokenValidation(token, request, response, next);
};

/**
 * Initialize response local variables with default values
 * @param {object} response - Express response object
 */
function initializeResponseLocals(response) {
    const defaultLocals = {
        userId: '',
        userName: '',
        userPhoto: '',
        userPrivilege: '',
        userArea: ''
    };

    Object.entries(defaultLocals).forEach(([key, defaultValue]) => {
        response.locals[key] = response.locals[key] || defaultValue;
    });
}

/**
 * Determine if token validation should be skipped for public routes
 * @param {string|undefined} token - JWT token from cookies
 * @param {string} url - Current request URL
 * @returns {boolean} true or false
 */
function shouldSkipTokenValidation(token, url) {
    return !token && PUBLIC_ROUTES.includes(url);
}

/**
 * Determine if authenticated user should be redirected from login pages
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
 * Process JWT token validation and authorization
 * @param {string|undefined} token - JWT token from cookies
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
    response.locals.userName = decodedToken.name || '';
    response.locals.userPhoto = sanitizePhotoPath(decodedToken.foto);
    response.locals.userPrivilege = decodedToken.privilegio || '';
    response.locals.userArea = decodedToken.area || '';
    response.locals.userId = decodedToken.userId || '';
}

/**
 * Sanitize photo path by removing 'public' prefix
 * @param {string} photoPath - Original photo path
 * @returns {string} Sanitized photo path
 */
function sanitizePhotoPath(photoPath) {
    return photoPath ? photoPath.replace('public', '') : '';
}

/**
 * Check if request is for lobby or profile access
 * @param {string} url - Request URL
 * @returns {boolean} true or false
 */
function isLobbyOrProfileAccess(url) {
    return url === HOME_REDIRECT || url === '/getPfp';
}

/**
 * Validate user permissions using IAM configuration (currently disabled)
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