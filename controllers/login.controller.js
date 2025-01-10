// Importar el modelo para utilizarlo
const loginModel = require('../models/usuarios.model.js');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');


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

        // set cookie back here, do not go client side
        //1 TODO Check cookies and Check rememberMe
                const cookieExample = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkltYW5vbE1Ac2l2b2MuY29tIiwicm9sZSI6ImFkbWluaXN0cmFkb3IiLCJuYW1lIjoiQWxmb25zbyIsImZvdG8iOiJwdWJsaWNcXHVwbG9hZHNcXHVzdWFyaW9zXFxmaWxlLTE3MzYxNTY2OTUxNTMtNDU2MDM0MDIwLmpwZyIsImlhdCI6MTczNjQ0NTY5OSwiZXhwIjoxNzM3NzQxNjk5fQ.KaGRDJD_SjEUhRoNbdgqra5ijXoV62jNnrBRXX1WNA4";
                const rememberMeExample = true;
        // process here
        const isGenerated = await genTokenOnValidAuthentication(user, cookieExample, rememberMeExample);
        if (!isGenerated.success) {
            return res.status(500).json({ success: false, message: "" });
        }

        //2 TODO if (isGenerated.accessToken !== "") then overwrite your cookie in the browser

        return res.status(200).json({ success: true, authorized: true, redirectUrl: "/usuarios" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }
};

async function genTokenOnValidAuthentication (user, jwtSent, rememberMe) {
        try {
            jwt.verify(jwtSent, process.env.ACCESS_TOKEN_SECRET); // decoded info or controlled error only responses
            return { success: true, accessToken: "" };
        } catch (error) {
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
                let timeExpiration = process.env.SESSION_LIFETIME;
                if (rememberMe) { timeExpiration = "15d" };

                const newAccessToken = jwt.sign(
                    { foto: user.foto, name: user.name, email: user.email,  privilegio: user.privilegio },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: timeExpiration } 
                );
                return { success: true, accessToken: newAccessToken };
            } else {
                console.error(error);
                return { success: false, accessToken: "" };
            }
        }
}

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