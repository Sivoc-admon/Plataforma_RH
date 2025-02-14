// Importar el modelo para utilizarlo
const filesModel = require("../models/files.model");
const permitsModel = require("../models/permisos.model");
const teamsSchema = require("../models/equipos.model");

const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit'); // Assuming you are using pdfkit
const crypto = require('crypto');


const express = require("express");
const multer = require("multer");

const app = express();



exports.createPermitRequest = async (req, res) => {
    // El pdf se crea
    //console.log("📌 req.body:", req.body);   // Muestra los datos enviados (registro, filtro, userId, etc.)
    //console.log("📌 req.files:", req.files); // Muestra los archivos subidos (PDFs)
    //console.log("📂 Archivos recibidos:", JSON.stringify(req.files, null, 2));

    

    try {
    // 0. Sanitize everything before anything
    // GLOBAL MIDDLEWARE, ABOSLUTELY NO MISTAKES ON SNANTITIZIAITON AND AUTOMTICACCC !!!!
    
    // A. FILE VALIDATION is done in "configureFileUpload.js" as a multer middleware

    // B. BODY VALIDATION
        // 1. Validate field arrangement 
        const allowedFields = ["registro", "filtro", "fechaInicio", "fechaTermino"];
        const receivedFields = Object.keys(req.body);
        const hasExtraFields = receivedFields.some(field => !allowedFields.includes(field));
        if (hasExtraFields)
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#001)" });

        //Effective error messages are clear, concise, and provide a solution to the problem. They should help users fix the issue as quickly as possible. 


        // 2. Validate field quality 
        const { registro, filtro, fechaInicio, fechaTermino } = req.body;
        if (!registro || !filtro || !fechaInicio || !fechaTermino ||
            typeof registro !== "string" || typeof filtro !== "string" ||
            typeof fechaInicio !== "string" || typeof fechaTermino !== "string") {
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#002)" });
        }

        // 3. Validate dates
        const fechaInicioDate = new Date(fechaInicio);
        const fechaTerminoDate = new Date(fechaTermino);
        const today = new Date();
        if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaTerminoDate.getTime())) 
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#003)" });
        const fechaInicioTime = fechaInicioDate.getTime();
        const fechaTerminoTime = fechaTerminoDate.getTime();
        if (fechaInicioTime >= fechaTerminoTime || today > fechaInicioTime || today > fechaTerminoTime) 
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#004)" });
        if (registro === "Incapacidad" && fechaInicioDate.getHours() !== 0) 
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#005)" });


    // C. MODEL LOGIC
    const formatReadableDateTime = (isoDate) => {
        const date = new Date(isoDate);
        let readableDate = date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        let readableTime = date.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false

        });
       if (readableTime === "24:00") {
            readableTime = "00:00";
        }
        return `${readableDate}, ${readableTime}`;
    };


        // 1. Build payload
        let docResponses = [];
        if (req.files.length > 0) {
            await Promise.all(
                req.files.map(async (file) => {
                    const response = await filesModel.create(file);
                    docResponses.push(response);
                })
            );
        }
        
        let paths = [];
        for (const item of docResponses) 
            paths.push(item._id);    
        


        // SON 2 PAYLOADS, UNO QUE SE FABRICA POR ARCHIVO Y LUEGO HACE CREATE POR CADA ARCHIVO 
        // EL OTRO ES ESTE, ESTE ES EL FINAL, DOCPATHS SON LOS OBJECT IDS DEL CREATE DE CADA ARCHIVO
        // docpathd came friom uplñoad to mongodfbvb

        // to get payloads, you need to creat them first
    
        console.log("paths: " + paths);
        const payload = {
            userId: res.locals.userId,
            registro: req.body.registro,
            filtro: req.body.filtro,
            fechaInicio: formatReadableDateTime(req.body.fechaInicio),
            fechaTermino: formatReadableDateTime(req.body.fechaTermino),
            docPaths: paths,
            estatus: "Pendiente",
            isSent: false,
            isVerified: false,
        };
        
        // Execute mongoose action
        const response = await permitsModel.create(payload);
        console.log(response);
        return res.status(200).json({ success: true }); 

    } catch (error) {
        console.error(error);
        // Controlled mongoose error (Data validation)
        if (error instanceof mongoose.Error.ValidationError) 
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#006)" });
        // Else, respond as internal error
        return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#007)"});
    }
};
 
exports.viewPermitsRowFile = async (req, res) => {
    try {
    // A. BODY VALIDATION
        // 1. Validate field quality 
        const { permitId, filename } = req.params;
        if (!permitId || !filename || typeof permitId !== "string" || typeof filename !== "string")
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#008)" });
        if (!mongoose.Types.ObjectId.isValid(permitId)) 
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#009)" });

    // B. MODEL VALIDATION
        // 1. Validate the permit has that file
        const response = await permitsModel.findOne({_id : permitId })
                                            .populate('docPaths', 'originalname filename');
        const matchingDoc = response.docPaths.find(item => item.originalname === filename);

    // C. MODEL LOGIC
        // 1. Send the file with its serial name
        if (matchingDoc) {
            const filePath = path.join(__dirname, '..', 'uploads', 'permisos', matchingDoc.filename);
            res.sendFile(filePath, (err) => {
                if (err) {
                    res.status(404).send('No se encontró el archivo PDF.');
                }
            });
        }

    } catch (error) {
        res.status(500).send('Tomar captura y favor de informar a soporte técnico. (#008)');
    }
};






exports.changeStatus = async (req, res) => {
    // ✅ Aplicar validación (FIXED)


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