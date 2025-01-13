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

        if (!user.estaActivo) {
            return res.status(401).json({ success: true, authorized: false, message: "El usuario se encuentra desactivado." });
        }

        const isMatching = await bcrypt.compare(req.body.password, user.password);
        if (!isMatching) {
            return res.status(401).json({ success: true, authorized: false, message: "La contraseña ingresada es incorrecta." });
        }

        // set cookie back here, dont let this token out of here
        const isGenerated = await genTokenOnValidAuthentication(user, req.cookies.__psmxoflxpspgolxps_mid, req.body.remember);
        if (!isGenerated.success) {
            return res.status(500).json({ success: false, message: "" });
        } else if (isGenerated.accessToken !== ""){
            res.cookie('__psmxoflxpspgolxps_mid', isGenerated.accessToken, { httpOnly: true, secure: true, sameSite: 'Strict' });  
        }
        global.activeUsers.add(user._id.toString()); // user set to ensure unique ids
        return res.status(200).json({ success: true, authorized: true, redirectUrl: "/login/inicio"});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }
};

async function genTokenOnValidAuthentication (user, jwtSent, remember) {
        try {
            jwt.verify(jwtSent, process.env.ACCESS_TOKEN_SECRET); // decoded info or controlled error only responses
            return { success: true, accessToken: "" };
        } catch (error) {
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
                let timeExpiration = "33h";
                if (remember) { 
                    timeExpiration = process.env.SESSION_LIFETIME;
                };
                const newAccessToken = jwt.sign(
                    { foto: user.foto, name: user.nombre, userId: user._id.toString(), email: user.email,  privilegio: user.privilegio },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: timeExpiration } 
                );
                return { success: true, accessToken: newAccessToken, timeExpiration: timeExpiration};
            } else {
                console.error(error);
                return { success: false, accessToken: "", timeExpiration: timeExpiration};
            }
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

// Renderizar página de inicio
exports.getInicioView = (req, res) => {
    try {
        return res.render('login/inicio.ejs');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};