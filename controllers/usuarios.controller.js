// Importar el modelo para utilizarlo
const usersModel = require("../models/usuarios.model");
const filesModel = require("../models/files.model");
const bcrypt = require("bcryptjs");


/* --- MODEL LOGIC --- */

exports.postEmailExists = async (req, res) => {
    try {
        const response = await usersModel.findOne({ email: req.body.email });
        if (!response) {
            return res.status(200).json({ success: true, exists: false });
        }
        return res.status(200).json({ success: true, exists: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, exists: false });
    }
};

exports.postAddUser = async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10); // password encryption          
        const response = await usersModel.create(req.body);
        return res.status(200).json({ success: true, message: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }
}

exports.postFileUpload = async (req, res) => {
    try {
        const response = await filesModel.create(req.file);
        return res.status(200).json({success: true, message: response}); // response.path = file location
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
    }
};

exports.postUserDeactivation = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Execute findByIdAndUpdate
        const response = await usersModel.findByIdAndUpdate(
            userId, 
            { $set: { estaActivo: false } }, // Change attribute
            { new: true } 
        );

        // If for some reason user not found, send 404
        if (!response) {
            return res.status(404).json({success: false, message: "" });
        }

        activeUsers.delete(userId); // log him out 
        return res.status(200).json({success: true, message: ""});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
    }
};

exports.postUserActivation = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Execute findByIdAndUpdate
        const response = await usersModel.findByIdAndUpdate(
            userId, 
            { $set: { estaActivo: true } }, // Change attribute
            { new: true } 
        );

        // If for some reason user not found, send 404
        if (!response) {
            return res.status(404).json({success: false, message: "" });
        }

        return res.status(200).json({success: true, message: ""});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
    }
};

exports.postUserChangePrivilege = async (req, res) => {
    try {
        const userId = req.body.userId;
        const newPrivilege = req.body.newPrivilege

        // Execute findByIdAndUpdate
        const response = await usersModel.findByIdAndUpdate(
            userId, 
            { $set: { privilegio: newPrivilege } }, // Change attribute
            { new: true } 
        );

        // if for some reason user not found, send 404
        if (!response) {
            return res.status(404).json({success: false, message: "" });
        }

        // send correct execution
        activeUsers.delete(userId); // log him out 
        return res.status(200).json({success: true, message: ""});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
    }
};

/* --- VIEWS LOGIC --- */
exports.getUsersView = async (req, res) => {
    try {
        const usersRows = await usersModel.find({ estaActivo: true }).select('-email -foto -password');
        return res.render('usuarios/usuarios.ejs', { usersRows });
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};

exports.getRestoreUsersView = async (req, res) => {
    try {
        const usersRows = await usersModel.find({ estaActivo: false }).select('-email -foto -password');
        return res.render('usuarios/restaurar-usuarios.ejs', { usersRows });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};


