const express = require('express');
const router = express.Router();
const controller = require('../controllers/cursos.controller');

router.get('/', controller.getCoursesView);

module.exports = router;