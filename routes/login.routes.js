/* --- Import routes.js logic --- */
const express = require('express');
const router = express.Router();
const { valLoginForm } = require('../controllers/services/form.validator'); 

// Rutas instantáneas (GET)
router.get('/', (req, res) => { res.render('login.ejs'); });

// Rutas para métodos HTTP (POST)
//router.post('/postAuth', valLoginForm, );

module.exports = router;