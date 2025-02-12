// Importar el modelo para utilizarlo
const filesModel = require("../models/files.model");
const permitsModel = require("../models/permisos.model");
const teamsSchema = require("../models/equipos.model");

const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit'); // Assuming you are using pdfkit
const crypto = require('crypto');


const validator = require("../validators/permisos.validator"); // access via validator.{action}
const express = require("express");
const multer = require("multer");

const app = express();


exports.createPermitRequest = async (req, res) => {
    // El pdf se crea on successful exection.
    console.log("📌 req.body:", req.body);   // Muestra los datos enviados (registro, filtro, userId, etc.)
    console.log("📌 req.files:", req.files); // Muestra los archivos subidos (PDFs)

    try {
    // A. FILES VALIDATION (optional from user)
        // skip if no files where added from the user
        if (req.files.length > 0) {
            const allowedExtensions = ['png', 'jpeg', 'jpg', 'pdf', 'doc', 'docx'];
            const MAX_FILES = 3;
            const MAX_SIZE_MB = 3 * 1024 * 1024; // 3MB en bytes
            const allowedFileTypes = [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ];
            if (req.files.length > MAX_FILES) 
                return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });
            
            for (const file of req.files) {
                const { rawname, mimetype, size } = file;

                const originalname =  ((x) => x.replace(/[<>:"'/\\|?*]/g, "").substring(0, 51) || "unknown_file")(rawname);
                if (originalname !== rawname)
                    return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });

                const fileExtension = originalname.split('.').pop().toLowerCase();
                if (!allowedExtensions.includes(fileExtension)) 
                    return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });
                if (!allowedFileTypes.includes(mimetype)) 
                    return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });
                if (size > MAX_SIZE_MB) 
                    return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });
                if (!size)
                    return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });
            }
        }

    // B. BODY VALIDATION
        // 1. Validate field arrangement 
        const allowedFields = ["registro", "filtro", "fechaInicio", "fechaTermino"];
        const receivedFields = Object.keys(req.body);
        const hasExtraFields = receivedFields.some(field => !allowedFields.includes(field));
        if (hasExtraFields)
            return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });

        // 2. Validate field quality 
        const { registro, filtro, fechaInicio, fechaTermino } = req.body;
        if (!registro || !filtro || !fechaInicio || !fechaTermino ||
            typeof registro !== "string" || typeof filtro !== "string" ||
            typeof fechaInicio !== "string" || typeof fechaTermino !== "string") {
            return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });
        }

        // 3. Validate dates
        const fechaInicioDate = new Date(fechaInicio);
        const fechaTerminoDate = new Date(fechaTermino);
        const today = new Date();
        if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaTerminoDate.getTime())) 
            return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });
        const fechaInicioTime = fechaInicioDate.getTime();
        const fechaTerminoTime = fechaTerminoDate.getTime();
        if (fechaInicioTime >= fechaTerminoTime || today > fechaInicioTime) 
            return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });
        if (registro === "Incapacidad" && fechaInicioDate.getHours() !== 0) 
            return res.status(400).json({ success: false, messageTitle: "modified", messageText: "Se ha detectado un intento de actividad maliciosa." });


    // C. MODEL LOGIC
        // Una vez que se pasaron las validaciones DEBES crear un payload que pase la ultima validación de MOONGOSE
        // en este caso sigue el modelo y no tanto los campos en la base de datos

        // el res.locals.userId pues ya está validado ntp (1)
        const response = await permitsModel.create(req.body);
        // recuerda que el model lanza errores, trata de controla en especifico el error del model
        return res.status(200).json({ success: true, messageTitle: "true", messageText: "success" }); // response.path = file location

    } catch (error) {
        console.error(error);
        // Controlled mongoose error (Data validation)
        if (error instanceof mongoose.Error.ValidationError) 
            return res.status(400).json({ success: false, messageTitle: "mongoose", messageText: "model"});
        // Else, respond as internal error
        return res.status(500).json({ success: false, messageTitle: "false", messageText: "error"});
    }
};
    
    /*
        📌 req.body: [Object: null prototype] {
        registro: 'Permiso',
        filtro: 'Cita Medica',
        fechaInicio: '2025-02-10T11:05',
        fechaTermino: '2025-04-05T11:05',
        userId: '678015aab366e37052cf12bc'
        }
        📌 req.files: [
        {
            fieldname: 'files',
            originalname: 'Semblanza (1).pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            destination: 'uploads/permisos',
            filename: 'files-1738947966555-815359186.pdf',
            path: 'uploads\\permisos\\files-1738947966555-815359186.pdf',
            size: 842619
        }
        ]

    */

// REMADE CONTROLLERS
exports.viewPermitsRowFile = async (req, res) => {

    // ✅ Validation
    const { error } = validator.viewPermitsRowFile(req.params.filename);
    if (error) {
        return res.status(400).json({ success: false, message: error.details.map(d => d.message).join(", ") });
    }

    // ✅ Model
    try {
        const response = await permitsModel.findOne({});
        const filePath = path.join(__dirname, '..', 'uploads', 'permisos', req.params.filename);
        res.sendFile(filePath, (err) => {
            if (err) {
                res.status(404).send('Correct. No se encontró el archivo PDF.');
            }
        });
    } catch (error) {
        return res.status(500).send('Favor de contactar a Soporte Técnico. (Error #030)');
    }

};






exports.changeStatus = async (req, res) => {
    // ✅ Aplicar validación (FIXED)
    const { error } = validator.changeStatus(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details.map(d => d.message).join(", ") });
    }

    // ✅ Lógica del modelo 
    try {
        const { permitId, estatus } = req.body;
        const updatedPermit = await permitsModel.findByIdAndUpdate(
            permitId, 
            { 
                $set: { 
                    estatus: estatus,
                } 
            },
            { new: true } 
        );
        if (!updatedPermit) {
            return res.status(404).json({ success: false, message: "Permiso no encontrado" });
        }

        return res.status(200).json({ success: true, message: "Permiso actualizado correctamente." });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }

};
















































exports.getDownloadPDF = async (req, res) => {
    /*
    try {
        let permitsRows = "";

        // Permits module for "jefeInmediato"
        if (res.locals.userPrivilege === "jefeInmediato") {
            // get all members from the team, map all their permits in a single array
            const team = await teamsSchema.find({ jefeInmediatoId: res.locals.userId }).select('-__v');
            if (team.length > 0) {
                const teamData = team[0]; // use the first team as string init for appends
                const permitPromises = teamData.colaboradoresIds.map(userId => {
                    // populate inserts the object referenced inside the query (check permitsModel.js)
                    return permitsModel.find({ userId: userId, isSent: true })
                            .populate('userId', 'nombre apellidoP apellidoM')
                            .populate('docPaths', '_id originalname filename path') 
                            .select('-__v');
                });
                const permitsResults = await Promise.all(permitPromises);
                permitsRows = permitsResults.flat(); // compact all permits as a single array
            }







            const PDFDocument = require('pdfkit');
const fs = require('fs');
const crypto = require('crypto');

// Crear un nuevo documento PDF
const doc = new PDFDocument();
const filename = crypto.randomUUID() + ".pdf";
const outputFilePath = `./uploads/temp/${filename}`;

// Escribir el archivo PDF en el sistema de archivos
const stream = fs.createWriteStream(outputFilePath);
doc.pipe(stream);

// Definir los encabezados de la tabla
const headers = ['Colaborador', 'Tipo Permiso', 'Fecha inicio', 'Fecha termino', 'Consultar docs', 'Estatus', 'Acciones'];
const columnWidths = [150, 120, 100, 100, 120, 100, 100]; // Ancho de las columnas
const startX = 50; // X de inicio
let startY = doc.y;

// Función para dibujar los encabezados
function drawTableHeader() {
    doc.fontSize(12).fillColor('white').text(headers[0], startX, startY, { width: columnWidths[0], align: 'center', backgroundColor: '#4CAF50' });
    doc.text(headers[1], startX + columnWidths[0], startY, { width: columnWidths[1], align: 'center', backgroundColor: '#4CAF50' });
    doc.text(headers[2], startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: 'center', backgroundColor: '#4CAF50' });
    doc.text(headers[3], startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: 'center', backgroundColor: '#4CAF50' });
    doc.text(headers[4], startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: 'center', backgroundColor: '#4CAF50' });
    doc.text(headers[5], startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4], startY, { width: columnWidths[5], align: 'center', backgroundColor: '#4CAF50' });
    doc.text(headers[6], startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4] + columnWidths[5], startY, { width: columnWidths[6], align: 'center', backgroundColor: '#4CAF50' });
    
    // Dibujar una línea debajo del encabezado
    doc.moveTo(startX, startY + 20).lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), startY + 20).stroke();
    startY += 30; // Moverse para las filas
}

// Dibujar encabezado de la tabla
drawTableHeader();

// Función para agregar filas
function addTableRow(permit, index) {
    doc.fontSize(10).fillColor('black');
    doc.text(permit.userId.nombre + " " + permit.userId.apellidoP + " " + permit.userId.apellidoM, startX, startY, { width: columnWidths[0], align: 'center' });
    doc.text(permit.registro, startX + columnWidths[0], startY, { width: columnWidths[1], align: 'center' });
    doc.text(permit.fechaInicio, startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: 'center' });
    doc.text(permit.fechaTermino, startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: 'center' });
    doc.text(permit.docPaths && permit.docPaths.length > 0 ? permit.docPaths.map(doc => doc.originalname).join(', ') : 'No hay documentos', startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: 'center' });
    
    let status = '';
    if (permit.estatus === 'Aprobado') status = '✔ Aprobado';
    else if (permit.estatus === 'Cancelado') status = '❌ Cancelado';
    else status = permit.estatus;
    
    doc.text(status, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4], startY, { width: columnWidths[5], align: 'center' });
    
    let actions = permit.isVerified ? 'Cerrado' : 'Pendiente';
    doc.text(actions, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4] + columnWidths[5], startY, { width: columnWidths[6], align: 'center' });
    
    // Dibujar una línea debajo de la fila
    doc.moveTo(startX, startY + 10).lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), startY + 10).stroke();
    startY += 20; // Moverse hacia abajo para la siguiente fila
}

// Añadir las filas de la tabla
permitsRows.forEach((permit, index) => {
    addTableRow(permit, index);
});

// Finalizar el documento y esperar a que se cierre el stream
doc.end();

stream.on('finish', () => {
    res.download(outputFilePath, filename, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error sending file.' });
        }

        // Después de enviar el archivo, eliminarlo
        fs.unlink(outputFilePath, (err) => {
            if (err) {
                console.error('Hubo un error al eliminar el archivo:', err);
                return res.status(500).json({ message: 'Hubo un error al eliminar el archivo' });
            }
        });
    });
});












            if (permitsRows.length === 0) {
                // TODO, download mesaje warning no hay información para pdf
                return res.status(404).json({ success: false, message: 'No users found to export.' });
            }

            return true;

        // Permits module for "rHumanos"
        } else if (res.locals.userPrivilege === "rHumanos") {
            // get all permits regardless of the user but must be sent
            permitsRows = await permitsModel.find({ isSent: true })                            
                            .populate('userId', 'nombre apellidoP apellidoM area')
                            .populate('docPaths', '_id originalname filename path') 
                            .select('-__v');

            console.log("PDF rHumanos: " + permitsRows);
            return true;
        }
        // catch non-authenticated user
        return res.redirect("/login");

    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }



       
*/
return res.status(200).json({ success: true, message: "" });


};



exports.postVerifyPermit = async (req, res) => {
    try {
        const response = await permitsModel.findByIdAndUpdate(
            req.body._id, 
            { 
                $set: { 
                    isVerified: true,
                } 
            },
            { new: true } 
        );
        return res.status(200).json({ success: true, message: "" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }

};


exports.postSendPermit = async (req, res) => {
    try {
        const response = await permitsModel.findByIdAndUpdate(
            req.body._id, 
            { 
                $set: { 
                    isSent: true,

                } 
            },
            { new: true } 
        );
        return res.status(200).json({ success: true, message: "" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }

};

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

/****************/
/*************/
/**********/
/*******/
/****/
/**/



/* --- VIEWS LOGIC --- */
exports.accessPermitsModule = async (req, res) => {
    try {
        let permitsRows = "";

        // Permits module for "colaborador"
        if (res.locals.userPrivilege === "colaborador") {
            // get all permits from a single user
            permitsRows = await permitsModel.find({ userId: res.locals.userId })
                .populate('docPaths', '_id originalname filename') // Esto llena docPaths con los datos de la colección 'archivos'
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
                    return permitsModel.find({ userId: userId, isSent: true })
                            .populate('userId', 'nombre apellidoP apellidoM')
                            .populate('docPaths', '_id originalname filename path') 
                            .select('-__v');
                });
                const permitsResults = await Promise.all(permitPromises);
                permitsRows = permitsResults.flat(); // compact all permits as a single array
            }
            return res.render('permisos/jefeInmediatoPermitsView.ejs', { permitsRows });


        // Permits module for "rHumanos"
        } else if (res.locals.userPrivilege === "rHumanos") {
            // get all permits regardless of the user but must be sent
            permitsRows = await permitsModel.find({ isSent: true })                            
                            .populate('userId', 'nombre apellidoP apellidoM area')
                            .populate('docPaths', '_id originalname filename path') 
                            .select('-__v');
            return res.render('permisos/rHumanosPermitsView.ejs', { permitsRows });
        
        
        // Permits module for "direccion"
        } else if (res.locals.userPrivilege === "direccion") {
            // get all permits regardless of the user but must be sent
            permitsRows = await permitsModel.find({ isSent: true })                            
                            .populate('userId', 'nombre apellidoP apellidoM area')
                            .populate('docPaths', '_id originalname filename path') 
                            .select('-__v');
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