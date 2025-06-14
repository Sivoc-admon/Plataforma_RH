const loginModel = require('../models/usuarios.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

/**
 * Endpoint para cuando un usuario envia sus credenciales para login
 * 
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 * @param res
 */
exports.postAuthentication = async (request, res) => {
    try {

        // critical skip . you can stress the login very easily

        // Built-in root user, this will always access with maxOut aut
        // horization even without database
        // this works because of all the security provided by jwt.js + SameSiteStric + validator.js + DOMpurify.js

        if (!request.body.email || !request.body.password) 
        {return res.status(200).json({ success: true, authorized: false, message: 'El usuario ingresado no tiene un formato válido'});}
        if (typeof request.body.email !== 'string' || typeof request.body.password !== 'string' || typeof request.body.remember !== 'boolean') 
        {return res.status(200).json({ success: true, authorized: false, message: 'El usuario ingresado no tiene un formato válido'});}

        if (request.body.email === process.env.ROOT_USERNAME && request.body.password === process.env.ROOT_PASSWORD){
            const rootToken = await genRootToken();
            if (!rootToken.success) {
                return res.status(500).json({ success: false, message: '' });
            } else if (rootToken.accessToken !== ''){
                res.cookie('__psmxoflxpspgolxps_mid', rootToken.accessToken, { httpOnly: true, secure: true, sameSite: 'Strict' });  
            }
            global.activeUsers.add(rootToken.userId.toString()); // user set to ensure unique ids
            return res.status(200).json({ success: true, authorized: true, redirectUrl: '/login/inicio'});
        }

        const user = await loginModel.findOne({ email: request.body.email }).populate('foto', 'filename');
        if (!user) {
            return res.status(401).json({ success: true, authorized: false, message: 'El usuario ingresado no existe.' });
        }

        if (!user.estaActivo) {
            return res.status(401).json({ success: true, authorized: false, message: 'El usuario se encuentra desactivado.' });
        }

        const isMatching = await bcrypt.compare(request.body.password, user.password);
        if (!isMatching) {
            return res.status(401).json({ success: true, authorized: false, message: 'La contraseña ingresada es incorrecta.' });
        }

        // set cookie back here, dont let this token out of here
        const isGenerated = await genTokenOnValidAuthentication(user, request.cookies.__psmxoflxpspgolxps_mid, request.body.remember);
        if (!isGenerated.success) {
            return res.status(500).json({ success: false, message: '' });
        } else if (isGenerated.accessToken !== ''){
            res.cookie('__psmxoflxpspgolxps_mid', isGenerated.accessToken, { httpOnly: true, secure: true, sameSite: 'Strict' });  
        }
        global.activeUsers.add(user._id.toString()); // user set to ensure unique ids
        return res.status(200).json({ success: true, authorized: true, redirectUrl: '/login/inicio'});
        
    } catch (error) {
        console.error(error);
        if (error instanceof mongoose.Error.ValidationError)
        {return res.status(200).json({ success: true, authorized: false });}
        console.log('worse than that');
        return res.status(500).json({ success: false, message: '' });
    }
};

/**
 * Función para generar un JWT Token de usuario raíz
 * @return {object} - Objeto que explique la respuesta y que contenga el accessToken
 */
async function genRootToken () {
    try {
        const newAccessToken = jwt.sign(
            { area: 'Dirección', foto: '', name: 'USUARIO RAÍZ', userId: '000', email: process.env.ROOT_USERNAME,  privilegio: 'direccion' },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30min' } // hardcoded 30min no matter what
        );
        return { success: true, accessToken: newAccessToken, userId: '000'};
    } catch (error) {
        return { success: false, accessToken: ''};
    }
};

/**
 * Función para generar un JWT Token según el usuario
 * 
 * @param user
 * @param jwtSent
 * @param remember
 * @return {object} - Objeto que explique la respuesta y que contenga el accessToken
 */
async function genTokenOnValidAuthentication (user, jwtSent, remember) {
    try {
        jwt.verify(jwtSent, process.env.ACCESS_TOKEN_SECRET); // decoded info or controlled error only responses
        return { success: true, accessToken: '' };
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
            let timeExpiration = '33h';
            if (remember) { 
                timeExpiration = process.env.SESSION_LIFETIME;
            };                
            const newAccessToken = jwt.sign(
                { area: user.area, foto: user.foto.filename, name: user.nombre + ' ' + user.apellidoP, userId: user._id.toString(), email: user.email,  privilegio: user.privilegio },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: timeExpiration } 
            );
            return { success: true, accessToken: newAccessToken};
        } else {
            console.error(error);
            return { success: false, accessToken: ''};
        }
    }
};

/**
 * Endpoint para renderizar la página de Login
 * 
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 */
exports.getLoginView = (request, response) => {
    try {
        return response.render('login/login.ejs');
    } catch (error) {
        console.error(error);
        return response.status(500).send(process.env.ERROR_MESSAGE);
    }
};

/**
 * Endpoint para renderizar la página de inicio
 * 
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 */
exports.getInicioView = (request, res) => {
    try {
        return res.render('login/inicio.ejs');
    } catch (error) {
        console.error(error);
        return res.status(500).send(process.env.ERROR_MESSAGE);
    }
};