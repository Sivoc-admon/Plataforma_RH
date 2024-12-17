// Importar el modelo para utilizarlo
const loginModel = require('../models/login.model.js');



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
        const user = await loginModel.find(req.body);
        if (user.length != 0) {
            res.status(200).json({ success: true, redirectUrl: "/login/homepage" });
        } else {
            res.status(401).json({ success: false, message: "Usuario no existente" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};



/* --- VIEWS LOGIC --- */

// Renderizar página de login
exports.getLogin = (req, res) => {
    try {
        res.render('login/login.ejs');
    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};

// Renderizar página de inicio (homepage)
exports.getHomepage = (req, res) => {
    try {
        res.render('login/homepage.ejs');
    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};
