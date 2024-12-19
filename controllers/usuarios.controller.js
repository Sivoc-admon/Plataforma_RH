// Importar el modelo para utilizarlo
const usersModel = require("../models/usuarios.model"); // TODO


/* --- MODEL LOGIC --- */




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
