/* Utilizando Node.js v20.13.1 */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();

// Utilidades
const { sessionManager } = require('./utils/middlewares/sessionManager');
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
    app.use(rbacMiddleware);
    app.use('/', require('./routes/global.routes'));
}

/**
 * Configura los archivos estáticos incluyendo el motor de vistas
 * @function
 * @returns {void}
 */
function setupStaticFilesAndViews() {
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
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
 * Inicializa la aplicación y atrapa los errores de ejecución.
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function initializeApp() {
    setupMiddlewares();
    setupStaticFilesAndViews();
    startServer();
    startPostgrest();
}
initializeApp().catch(error => {
    console.log(process.env.ERROR_MESSAGE, "001");
    console.log(error);
    process.exit(1);
});