const jwt = require('jsonwebtoken');
const iam = require('./IAM.json');

const authorize = (req, res, next) => {
    // Default value of local session variables
    res.locals.userName = res.locals.userName || 'Usuario';
    res.locals.userPhoto = res.locals.userPhoto || '';
    res.locals.userPrivilege = res.locals.userPrivilege || '';

    const token = req.cookies.__psmxoflxpspgolxps_mid;

    if (["/login", "/login/POSTAUTH"].includes(req.url)) {
        return next();     
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // if an admin made a change while user still logged in, throw error to enforce logIn again
        if (!activeUsers.has(decoded.userId)) {
            throw new Error("User information was edited by an admin.");
        }
        
        res.locals.userName = decoded.name;
        res.locals.userPhoto = decoded.foto.replace("public", "");
        res.locals.userPrivilege = decoded.privilegio;

        // if you arrive to the lobby you dont need any privileges, but do need a jwt
        if (req.url === "/login/inicio") {
            return next();
        } else {
            
            // TODO implement IAM here. BTW, Frontend IS DIFFERENT depending ON THE ROLE 
            // iam . (decoded.privilegio) . (url 1st portion, "/usuarios/agregar" = usuarios) . (url 2nd portion, "/usuarios/agregar" = agregar)

            /*
            const superadmin = {
                usuarios: {
                    accessUsersModule: true,
                    downloadExcelUsers: true,
                    downloadPDFUsers: true,
                    restoreUsersView: true,
                    addUser: true,
                    uploadFile: true,
                    deactivateUser: true,
                    activateUser: true,
                    "/existe-email": null, // Placeholder
                    userTableActions: true
                }
            };

            // Asignar el valor dinámicamente
            superadmin.usuarios["/existe-email"] = superadmin.usuarios.addUser;

            console.log(JSON.stringify(superadmin, null, 2));


            


            // construct the IAM path dynamically by extracting portions of the URL
            const urlParts = req.url.split('/').filter(part => part); 
            const firstPortion = urlParts[0] || ''; 
            const secondPortion = urlParts[1] || '';
            const privilege = decoded.privilegio;
            const permissionPath = iam?.[privilege]?.[firstPortion]?.[secondPortion];
                    
            if (!permissionPath) {
                console.log("Access Denied: Insufficient Permissions");
                // TODO error message something idk i have never seen a PopUp like this
                // the frontend is already managed by res.locals.userPrivilege = decoded.privilegio;
            }
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
