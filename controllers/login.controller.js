// Importar el modelo para utilizarlo
const loginModel = require('../models/login.model.js'); 



/* --- MODEL LOGIC --- */ 

// POST Endpoint para '/POSTAUTH'
exports.postAuthentication = async (req, res) => {
    try {
        const user = await loginModel.find(req.body);
        if (user.length != 0) {
            // TODO esto me lo está haciendo json y antes me lo ejecutaba
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
