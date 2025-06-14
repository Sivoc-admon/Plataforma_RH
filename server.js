/* Dependencies (Node.js v20.13.1) */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const fs = require('fs');

require('dotenv').config();

const { authorize } = require('./utils/jwt');
const { sanitizeInputs } = require('./utils/sanitizeInputs');

// Constantes
const DEFAULT_PORT = 3000;
const UNAUTHORIZED_STATUS_CODE = 401;
const NOT_FOUND_STATUS_CODE = 404;

global.mongoose = mongoose;

const app = express();

/**
 * Configura los middlewares globales de la aplicación
 * @function
 * @returns {void}
 */
function setupMiddlewares() {
    app.use(express.json());
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
}

/**
 * Configura los archivos estáticos y el motor de vistas
 * @function
 * @returns {void}
 */
function setupStaticFilesAndViews() {
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
}

/**
 * Establece la conexión con la base de datos MongoDB
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.URI);
        console.log('✅ Conexión exitosa a la base de datos.');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1);
    }
}

/**
 * Configura los middlewares de seguridad críticos
 * @function
 * @returns {void}
 */
function setupSecurityMiddlewares() {
    app.use(authorize);
    app.use(sanitizeInputs);
}

/**
 * Configura las rutas de la aplicación
 * @function
 * @returns {void}
 */
function setupRoutes() {
    app.use('/login', require('./routes/login.routes'));
    app.use('/usuarios', require('./routes/usuarios.routes'));
}

/**
 * Maneja la redirección a la página de login.
 * @function
 * @param {object} request - Objeto de solicitud de Express.
 * @param {object} response - Objeto de respuesta de Express.
 * @returns {void}
 */
function handleHomeRedirect(request, response) {
    response.redirect('/login');
}

/**
 * Maneja el cierre de sesión del usuario
 * @function
 * @param {object} request - Objeto de solicitud de Express
 * @param {object} response - Objeto de respuesta de Express
 * @returns {void}
 */
function handleLogout(request, response) {
    response.clearCookie(process.env.COOKIE_NAME);
    response.redirect('/login');
}

/**
 * Maneja las solicitudes no autorizadas
 * @function
 * @param {object} request - Objeto de solicitud de Express.
 * @param {object} response - Objeto de respuesta de Express.
 * @returns {void}
 */
function handleUnauthorized(request, response) {
    response.clearCookie(process.env.COOKIE_NAME);
    response.status(UNAUTHORIZED_STATUS_CODE).render('404.ejs');
}

/**
 * Maneja la solicitud de foto de perfil del usuario.
 * @function
 * @param {object} request - Objeto de solicitud de Express.
 * @param {object} response - Objeto de respuesta de Express.
 * @returns {void}
 */
function handleGetProfilePicture(request, response) {
    const filePath = path.join(__dirname, 'uploads', 'usuarios', response.locals.userPhoto);

    /**
     * Verifica si un archivo existe en el sistema de archivos
     * @function
     * @param {string} filePath - Ruta del archivo a verificar
     * @returns {boolean} True si el archivo existe, false en caso contrario
     */
    const doesfileExists = fs.existsSync(filePath);

    if (doesfileExists) {
        return response.sendFile(filePath);
    }

    return response.status(NOT_FOUND_STATUS_CODE).send('Archivo no encontrado');
}

/**
 * Configura las rutas globales de la aplicación
 * @function
 * @returns {void}
 */
function setupGlobalRoutes() {
    app.get('/', handleHomeRedirect);
    app.get('/logout', handleLogout);
    app.get('/Unauthorized', handleUnauthorized);
    app.get('/getPfp', handleGetProfilePicture);
}

/**
 * Inicia el servidor en el puerto especificado
 * @function
 * @returns {void}
 */
function startServer() {
    const port = process.env.PORT || DEFAULT_PORT;
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}

/**
 * Inicializa y configura la aplicación Express
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function initializeApp() {
    setupMiddlewares();
    setupStaticFilesAndViews();
    await connectToDatabase();
    setupSecurityMiddlewares();
    setupRoutes();
    setupGlobalRoutes();
    startServer();
}

// Inicializar la aplicación
initializeApp().catch(error => {
    console.error('❌ Error al inicializar la aplicación:', error);
    process.exit(1);
});