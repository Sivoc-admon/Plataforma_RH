/* --- Import routes.js logic --- */
const express = require('express');
const router = express.Router();
const { postAuthentication, doLogout } = require("../controllers/login.controller")
const URL_TAG = process.env.URL_TAG;

// Rutas instantáneas
router.get('/', (req, res) => { res.redirect(`${URL_TAG}/login`); });
router.get(`${URL_TAG}/login`, (req, res) => { res.render('login.ejs'); });
router.get(`${URL_TAG}/inicio`, (req, res) => { res.render('inicio.ejs'); });

// Rutas relacionadas con el Login
router.post(`${URL_TAG}/login/postAuth`, postAuthentication);
router.get(`${URL_TAG}/logout`, doLogout);


module.exports = router;
