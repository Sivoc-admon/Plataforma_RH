const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
    const token = req.cookies.__psmxoflxpspgolxps_mid;

    // Skip authorization for login-related routes
    if (req.url === "/login" || req.url === "/login/POSTAUTH") {
        return next();
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check if the route is not the homepage ("/login/inicio")
        // TODO, if not login lobby, then procced to implement IAM here.
        if (req.url !== "/login/inicio") {
            // If the user does not have the 'administrador' privilege, redirect to login
            if (decoded.privilegio !== 'administrador') {
                return res.redirect("/login");
            }

            // Attach the decoded user to the request object for further use
            req.user = decoded;

            // Proceed to the next middleware or route handler
            return next();
        }

        // If route is "/login/inicio", just proceed
        return next();

    } catch (error) {
        console.error('Token verification failed:', error);
        return res.redirect("/login");
    }
};

module.exports = { authorize };
