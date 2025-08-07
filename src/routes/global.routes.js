/* --- Import routes.js logic --- */
const express = require('express');
const router = express.Router();
const { postAuthentication, doLogout } = require("../controllers/login.controller");
const { generalLimiter } = require("../utils/middlewares/rateLimiter");

const NGINX_TAG = process.env.NGINX_TAG;
const URL_TAG = process.env.URL_TAG;

// Rutas por defecto (los redirects ocupan ${NGINX_TAG} )
router.get('/', (req, res) => { res.redirect(`${NGINX_TAG}${URL_TAG}/login`) });
router.get(`${URL_TAG}/inicio`, (req, res) => { res.render('inicio.ejs'); });

// Rutas relacionadas con el Login
router.get(`${URL_TAG}/login`, (req, res) => { res.render('login.ejs'); });
router.post(`${URL_TAG}/login/postAuth`, generalLimiter, postAuthentication);
router.get(`${URL_TAG}/logout`, doLogout);

// Rutas hacia los módulos
router.use(`${URL_TAG}/usuarios`, generalLimiter, require('./usuarios.routes'));
//router.use(`${URL_TAG}/permisos`, require('./permisos.routes'));
//router.use(`${URL_TAG}/vacaciones`, require('./vacaciones.routes'));
//router.use(`${URL_TAG}/cursos`, require('./cursos.routes'));


module.exports = router;