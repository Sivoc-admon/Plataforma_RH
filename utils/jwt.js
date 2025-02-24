const jwt = require('jsonwebtoken');
const iam = require('./IAM.json');

// Critical, protection against CRSF Attacks + IAM Configuration Structure
// Cookies generated from Loggin-in must be "{ httpOnly: true, secure: true, sameSite: 'Strict' }"

const authorize = (req, res, next) => {
    // Default value of local session variables
    res.locals.userId = res.locals.userId || '';
    res.locals.userName = res.locals.userName || '';
    res.locals.userPhoto = res.locals.userPhoto || '';
    res.locals.userPrivilege = res.locals.userPrivilege || '';
    res.locals.userArea = res.locals.userArea || '';

    const token = req.cookies.__psmxoflxpspgolxps_mid;

    if (["/login", "/login/POSTAUTH","/Unauthorized", "/logout"].includes(req.url) || req.url.startsWith("/uploads/"))
        return next();     

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // if an admin made a change while user still logged in, throw error to enforce logIn again
        if (!activeUsers.has(decoded.userId)) {
            throw new Error("User information was edited by an admin.");
        }
        
        res.locals.userName = decoded.name;
        res.locals.userPhoto = decoded.foto.replace("public", ""); // uploads . usuarios
        res.locals.userPrivilege = decoded.privilegio;
        res.locals.userArea = decoded.area;
        res.locals.userId = decoded.userId;

        // if you arrive to the lobby you dont need any privileges, but do need a jwt
        if (req.url === "/login/inicio") {
            return next();

        // if you do want to execute ANYTHING it must past the IAM test
        } else {
            // construct the IAM path dynamically by extracting portions of the URL
            const urlParts = req.url.split('/').filter(part => part); 
            const originModule = urlParts[0] || ''; 
            const actionToExecute = urlParts[1] || '';
            const privilege = decoded.privilegio;
            const permissionPath = iam?.[privilege]?.[originModule]?.[actionToExecute];

            /*
            console.log("originModule : " + originModule);
            console.log("privilege : " + privilege);
            console.log("actionToExecute : " + actionToExecute);
            console.log("permissionPath: " + permissionPath);
            
                    
            // if not enough permissions then detect Unauthorized
            if (!permissionPath) 
                return res.redirect("/Unauthorized");     
            */          
        }
        return next();
    } catch (error) {
        //console.error('Token verification failed:', error);
        res.clearCookie('__psmxoflxpspgolxps_mid');
        return res.redirect("/login");
    }
};

module.exports = { authorize };
