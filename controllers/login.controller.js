// Importar el modelo para utilizarlo
const loginModel = require('../models/usuarios.model.js');
const bcrypt = require("bcryptjs");


/* --- MODEL LOGIC --- */

// POST Endpoint para '/POSTAUTH'
exports.postAuthentication = async (req, res) => {
    try {
        const user = await loginModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ success: true, authorized: false, message: "El usuario ingresado no existe." });
        }

        const isMatching = await bcrypt.compare(req.body.password, user.password);
        if (!isMatching) {
            return res.status(401).json({ success: true, authorized: false, message: "La contraseña ingresada es incorrecta." });
        }

        return res.status(200).json({ success: true, authorized: true, redirectUrl: "/usuarios" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }
};

/* --- VIEWS LOGIC --- */

// Renderizar página de login
exports.getLoginView = (req, res) => {
    try {
        return res.render('login/login.ejs');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};