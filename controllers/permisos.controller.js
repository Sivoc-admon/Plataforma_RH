// Importar el modelo para utilizarlo
const filesModel = require("../models/files.model");
const permitsModel = require("../models/permisos.model");
const teamsSchema = require("../models/equipos.model");

const path = require('path');
const fs = require('fs');


/* --- MODEL LOGIC --- */
exports.deletePermit = async (req, res) => {
    try {
        const response = await permitsModel.deleteOne({ _id: req.body._id });
        return res.status(200).json({ success: true, message: "" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }

};

exports.postEditPermit = async (req, res) => {
    try {

        const response = await permitsModel.findByIdAndUpdate(
            req.body.permitId, 
            { 
                $set: { 
                    registro: req.body.registro, 
                    filtro: req.body.filtro,
                    fechaInicio: req.body.fechaInicio,
                    fechaTermino: req.body.fechaTermino,
                    docPaths: req.body.docPaths
                } 
            }, // Cambiar atributos
            { new: true } 
        );
    
        return res.status(200).json({ success: true, message: "" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }

};

exports.deleteFile = async (req, res) => {   
        try {            
            const filePath = path.join(__dirname, '..', 'uploads', 'permisos', req.body.dbName);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Hubo un error al eliminar el archivo:', err);
                    return res.status(500).json({ message: 'Hubo un error al eliminar el archivo' });
                }
            });

            const response = await filesModel.deleteOne({ _id: req.body._id });
            return res.status(200).json({ success: true, message: response });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "" });
        }
};

exports.getFileDownload = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'uploads', 'permisos', req.params.filename);
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error al intentar servir el archivo PDF:', err);
                res.status(404).send('No se encontró el archivo PDF.');
            }
        });
    } catch (error) {
        return res.status(500).send('Favor de contactar a Soporte Técnico. (Error #030)');
    }
};

exports.postFileUpload = async (req, res) => {
    try {
        // Check if files are present
        if (!req.files?.length) {
            return res.status(400).json({ success: false, message: "" });
        }

        // Save files to the database
        let docResponses = [];
        await Promise.all(
            req.files.map(async (file) => {
                const response = await filesModel.create(file);
                docResponses.push(response);
            })
        );

        return res.status(200).json({ success: true, message: docResponses });

    } catch (error) {
        return res.status(500).json({ success: false, message: "" });
    }
};


exports.createPermitRequest = async (req, res) => {
    try {
        const response = await permitsModel.create(req.body);
        return res.status(200).json({ success: true, message: "" }); // response.path = file location

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
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
            permitsRows = await permitsModel.find({ userId: res.locals.userId })
                .populate('docPaths', '_id originalname filename path') // Esto llena docPaths con los datos de la colección 'archivos'
                .select('-__v');
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