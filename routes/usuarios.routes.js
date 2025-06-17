const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarios.controller');
const configureFileUpload = require('../utils/configureFileUpload');

/**
 * Middleware que crea un array vacío si no subieron archivos
 * 
 * @param {object} request - Objeto de solicitud
 * @param {object} response - Objeto de respuesta
 * @param {Function} next - Función para continuar con el siguiente middleware
 */
const ensureFilesArray = (request, response, next) => {
    if (!request.files)
    {request.files = [];}
    next();
};
const allowedFileExtensions = ['png', 'jpeg', 'jpg'];
const MAX_SIZE_MB = 3 * 1024 * 1024; // 3MB in bytes
const allowedFileTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
];
const MAX_FILES = 1;

// accessUsersModule : rHumanos : Done
router.get('/accessUsersModule', controller.accessUsersModule);

// addUser : rHumanos : Done
const upload = configureFileUpload('uploads/usuarios', allowedFileTypes, allowedFileExtensions, MAX_SIZE_MB, MAX_FILES);
router.post('/addUser',
    ensureFilesArray,
    ...upload.array('files', MAX_FILES), // Errors go to Express default handler
    controller.addUser
);
router.post('/doesEmailExists', controller.doesEmailExists);

// restoreUsersView : rHumanos : Done
router.get('/restoreUsersView', controller.restoreUsersView);

// activateUser : rHumanos : Done
router.post('/activateUser', controller.activateUser);

// restoreUsersView : rHumanos : Done
router.get('/configureTeamView', controller.configureTeamView);

// deactivateUser : rHumanos : Done
router.post('/deactivateUser', controller.deactivateUser);

// changePassword : rHumanos : Done
router.post('/changePassword', controller.changePassword);

// editUser : rHumanos : Done
router.post('/editUser', controller.editUser); 

// createTeam : rHumanos : Done
router.post('/createTeam', controller.createTeam); 

// editTeam : rHumanos : ---
router.post('/editTeam', controller.editTeam); 

module.exports = router;