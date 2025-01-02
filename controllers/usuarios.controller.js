// Importar el modelo para utilizarlo
const usersModel = require("../models/usuarios.model");
const filesModel = require("../models/files.model");


/* --- MODEL LOGIC --- */

exports.postNewUser = async (req, res) => {
    try {
        const response = await usersModel.create(req.body);
        res.status(200).json({ success: true, message: "Usuario creado con éxito", response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Algo salió mal. Favor de contactar a soporte técnico." });
    }
}

exports.postFirstFile = async (req, res) => {
    try {
        // Guarda el archivo en la base de datos
        const response = await filesModel.create(req.file); 
        res.status(200).json({success: true});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false});
    }
};


/* --- VIEWS LOGIC --- */

// Renderizar página de inicio (homepage)
exports.getUsersView = async (req, res) => {
    try {
        // Fetch all users from the database
        const usersRows = await usersModel.find(); // Remove .populate('nombre') if 'nombre' is not a reference
        // Render the 'usuarios' view with the fetched users
        res.render('usuarios/usuarios.ejs', { usersRows });

    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};
