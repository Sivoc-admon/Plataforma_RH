// Importar el modelo para utilizarlo
const loginModel = require('../models/usuarios.model.js');
const bcrypt = require("bcryptjs");


// TODO, estandarizar respuestas en formato json {success: true/false, message: ""}
// TODO, complete remake of the login

/* --- MODEL LOGIC --- */

// POST Endpoint para '/POSTAUTH'
exports.postAuthentication = async (req, res) => {

    // Desinfección de campos de entrada
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Todos los campos son requeridos." });
    } else if (/[\{\}\:\$\=\'\*\[\]]/.test(email) || /[\{\}\:\$\=\'\*\[\]]/.test(password)) {
        return res.status(401).json({ success: false, message: "Uno o más campos contienen caracteres no permitidos: {} $ : = '' * [] " });
    }

    // Una vez pasó la desifección se permite ejecutar la operación asincrónica
    try {
        const user = await loginModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Usuario no existente" });
        }

        const isMatching = await bcrypt.compare(req.body.password, user.password);
        if (!isMatching) {
            return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
        }

        return res.status(200).json({ success: true, redirectUrl: "/usuarios" });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
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