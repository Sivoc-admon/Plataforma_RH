const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {

    res.locals.userName = res.locals.userName || 'Usuario';

    const token = req.cookies.__psmxoflxpspgolxps_mid;

    if (["/login", "/login/POSTAUTH", "/usuarios"].includes(req.url)) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // if an admin made a change while user still logged in, throw error to enforce logIn again
        if (!activeUsers.has(decoded.userId)) {
            throw new Error("User information was edited by an admin.");
        }
        
        // TODO implement IAM here.
        /*
        if (req.url !== "/login/inicio") {
            
            // AND BTW, Frontend IS DIFFERENT depending ON THE ROLE 
            if (decoded.privilegio !== 'administrador') {
                return res.redirect("/login");
            }
            req.user = decoded;
            return next();
        }
        */

        res.locals.userName = decoded.name;
        return next();

    } catch (error) {
        console.error('Token verification failed:', error);
        res.clearCookie('__psmxoflxpspgolxps_mid');
        return res.redirect("/login");
    }
};

module.exports = { authorize };
