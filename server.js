/* Dependencias (Node.js v20.13.1) */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();

const { authorize } = require('./utils/middlewares/rbac');
const { startPostgrest } = require('./utils/scripts/postgrestRunner');
const DEFAULT_PORT = 3000;

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
    //app.use(authorize);
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
 * Configura las rutas de la aplicación
 * @function
 * @returns {void}
 */
function setupRoutes() {
    //app.use('/login', require('./routes/login.routes'));
    //app.use('/inicio', (req, res) => { res.render('inicio.ejs'); });

    //app.use('/usuarios', require('./routes/usuarios.routes'));
}

/**
 * Maneja la redirección a la página de login.
 * @function
 * @param {object} request - Objeto de solicitud de Express
 * @param {object} response - Objeto de respuesta de Express
 * @returns {void}
 */
app.get('/', handleHomeRedirect);

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
app.get('/logout', handleLogout);
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

app.get('/Unauthorized', handleUnauthorized);
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
app.get('/getPfp', handleGetProfilePicture);

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
 * Inicia el servidor en el puerto especificado
 * @function
 * @returns {void}
 */
function startServer() {
    const port = process.env.PORT || DEFAULT_PORT;
    app.listen(port, () => {
        console.log(`[Server ✅]: Servidor corriendo en http://localhost:${port}`);
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
    setupRoutes();
    startServer();
    startPostgrest();
}

// Iniciar la aplicación
initializeApp().catch(error => {
    console.log(process.env.ERROR_MESSAGE, "002");
    process.exit(1);
});