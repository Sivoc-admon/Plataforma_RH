/* --- Import routes.js logic --- */
const express = require('express');
const router = express.Router();
const { postAuthentication } = require("../controllers/login.controller")
const URL_TAG = process.env.URL_TAG;

// Rutas instantáneas (GET)
router.get('/', (req, res) => { res.redirect(`${URL_TAG}/login`); });
router.get(`${URL_TAG}/login`, (req, res) => { res.render('login.ejs'); });
router.get(`${URL_TAG}/inicio`, (req, res) => { res.render('inicio.ejs'); });
router.get(`${URL_TAG}/logout`, (req, res) => {
    res.clearCookie(process.env.AT_COOKIE_NAME);
    res.clearCookie(process.env.RT_COOKIE_NAME);
    res.redirect(`${URL_TAG}/login`);
});

// Rutas para métodos HTTP (POST)
router.post(`${URL_TAG}/login/postAuth`, postAuthentication);

module.exports = router;
