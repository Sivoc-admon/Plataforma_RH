const express = require("express");
const router = express.Router();
const controller = require('../controllers/usuarios.controller');

// Storage directory (critical)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/usuarios'); // Destination folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Collision avoidance
    const extension = path.extname(file.originalname);
    const newName = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, newName);
  }
});
const upload = multer({ storage }); // Compacted into 'upload'

// TODO, cleanup after 80% backend framework
// remake so No Files are on app.use(express.static(path.join(__dirname, "public")));
// files upload must NOT be there, all files must be idk where

// Routes
router.get("/accessUsersModule", controller.getUsersView);
router.post("/downloadExcelUsers", controller.postDownloadExcelUsers);
router.post("/downloadPDFUsers", controller.postDownloadPDFUsers);
router.get("/restoreUsersView", controller.getRestoreUsersView);

router.post("/addUser", controller.postAddUser); 
router.post("/uploadFile", upload.single('file'), controller.postFileUpload);
router.post("/deactivateUser", controller.postUserDeactivation);
router.post("/activateUser", controller.postUserActivation);
router.post("/doesEmailExists", controller.postEmailExists);
router.post("/changePrivilege", controller.postUserChangePrivilege);

router.post("/editUser", controller.postEditUser); 

module.exports = router;