// Importar el modelo para utilizarlo
const filesModel = require("../models/files.model");
const permitsModel = require("../models/permisos.model");
const teamsSchema = require("../models/equipos.model");



/* --- MODEL LOGIC --- */
exports.postFileUpload = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({success: false, message: ""});
        }

        //const response = await filesModel.create(req.file); true for now 
        // desactivado para no generar registros de más en la base de atos TODO
        return res.status(200).json({success: true, message: "response"}); // response.path = file location

    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
    }
};

exports.createPermitRequest = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({success: false, message: ""});
        }

        //const response = await filesModel.create(req.file); true for now 
        // desactivado para no generar registros de más en la base de atos TODO
        return res.status(200).json({success: true, message: "response"}); // response.path = file location

    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
    }
};
/****************/
/*************/
/**********/
/*******/
/****/
/**/



/* --- VIEWS LOGIC --- */
exports.accessPermitsView = async (req, res) => {
    try {
        let permitsRows = "";

        // Permits module for "colaborador"
        if (res.locals.userPrivilege === "colaborador") {
            // get all permits from a single user
            permitsRows = await permitsModel.find({ userId: res.locals.userId }).select('-__v');
            return res.render('permisos/colaboradorPermitsView.ejs', { permitsRows });

        // Permits module for "jefeInmediato"
        } else if (res.locals.userPrivilege === "jefeInmediato") {
            // get all members from the team, map all their permits in a single array
            const team = await teamsSchema.find({ jefeInmediatoId: res.locals.userId }).select('-__v');
            if (team.length > 0) {
                const teamData = team[0]; // use the first team as string init for appends
                const permitPromises = teamData.colaboradoresIds.map(userId => {
                    // populate inserts the object referenced inside the query (check permitsModel.js)
                    return permitsModel.find({ userId: userId, isSent: true }).populate('userId', 'nombre apellidoP apellidoM').select('-__v');
                });
                const permitsResults = await Promise.all(permitPromises);
                permitsRows = permitsResults.flat(); // compact all permits as a single array
            }
            return res.render('permisos/jefeInmediatoPermitsView.ejs', { permitsRows });

        // Permits module for "rHumanos"
        } else if (res.locals.userPrivilege === "rHumanos") {
            // get all permits regardless of the user but must be sent
            permitsRows = await permitsModel.find({ isSent: true }).populate('userId', 'nombre apellidoP apellidoM').select('-__v');
            return res.render('permisos/rHumanosPermitsView.ejs', { permitsRows });
        }

        // catch non-authenticated user
        return res.redirect("/login");

    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};
/****************/
/*************/
/**********/
/*******/
/****/
/**/