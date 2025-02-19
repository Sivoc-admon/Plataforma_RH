const filesModel = require("../models/files.model");
const permitsModel = require("../models/permisos.model");
const teamsSchema = require("../models/equipos.model");
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit'); // Assuming you are using pdfkit
const crypto = require('crypto');
const { json } = require("body-parser");

// viewPermitsRowFile : Colaborador, JefeInmediato, rHumanos : Done
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
        const response = await permitsModel.findOne({ _id: permitId })
            .populate('docPaths', 'originalname filename').select('-__v');
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

// createPermitRequest : Colaborador : Done
exports.createPermitRequest = async (req, res) => {
    try {
        // A. FILE VALIDATION is done in "configureFileUpload.js" as a multer middleware

        // B. BODY VALIDATION
        // 1. Validate field arrangement 
        const allowedFields = ["registro", "filtro", "fechaInicio", "fechaTermino"];
        const receivedFields = Object.keys(req.body);
        const hasExtraFields = receivedFields.some(field => !allowedFields.includes(field));
        if (hasExtraFields)
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#001)" });

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
        const payload = {
            userId: res.locals.userId,
            registro: req.body.registro,
            filtro: req.body.filtro,
            fechaInicio: fechaInicio,
            fechaTermino: fechaTermino,
            docPaths: paths,
            estatus: "Pendiente",
            isSent: false,
            isVerified: false,
        };

        // 2. Execute mongoose action
        await permitsModel.create(payload);
        return res.status(200).json({ success: true });

    } catch (error) {
        //console.error(error);
        if (error instanceof mongoose.Error.ValidationError)
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#006)" });
        return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#007)" });
    }
};

// deletePermit : Colaborador : Done
exports.deletePermit = async (req, res) => {
    try {
        // A. BODY VALIDATION
        // 1. Validate field quality 
        const permitId = req.body.permitId;
        if (!permitId || typeof permitId !== "string")
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#018)" });

        // B. MODEL LOGIC
        // 1. Validate that the permit is eligible for deletion and also exists
        const response = await permitsModel.findOne({ _id: permitId, isSent: false, isVerified: false })
            .populate('docPaths', 'filename');
        if (!response)
            return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#022)" });

        // 2. For each file that the permit has remove the database entry and the file itself
        for (const item of response.docPaths) {
            const filePath = path.join(__dirname, '..', 'uploads', 'permisos', item.filename);
            fs.unlink(filePath, (err) => {
                if (err)
                    return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico.(#022)" });
            });
            const itemResponse = await filesModel.deleteOne({ _id: item._id });
        }

        // 3. Remove the information of the permit inside the collection
        const deletionResponse = await permitsModel.deleteOne({ _id: permitId });
        if (!deletionResponse)
            return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#024)" });

        return res.status(200).json({ success: true, message: "" });

    } catch (error) {
        return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#025)" });
    }
};

// sendPermit : Colaborador : Done
exports.sendPermit = async (req, res) => {
    try {
        // A. BODY VALIDATION
        // 1. Validate field quality 
        const permitId = req.body.permitId;
        if (!permitId || typeof permitId !== "string")
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#026)" });

        // B. MODEL LOGIC
        // 1. Validate that the permit is eligible for sending and also exists
        const response = await permitsModel.findOne({ _id: permitId, isSent: false, isVerified: false });
        if (!response)
            return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#027)" });

        // 2. Set isSent to true
        const updateResponse = await permitsModel.findByIdAndUpdate(permitId, { $set: { isSent: true } }, { new: true });
        if (!updateResponse)
            return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#028)" });

        return res.status(200).json({ success: true, message: "" });

    } catch (error) {
        return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#029)" });
    }
};

// editPermit : Colaborador : Done
exports.editPermit_getInfo = async (req, res) => {
    try {
        const { permitId } = req.body;

        if (!permitId || typeof permitId !== "string") {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#011)"
            });
        }

        const permit = await permitsModel.findOne({
            _id: permitId,
            isSent: false,
            isVerified: false
        }).populate('docPaths', 'originalname').select('-__v');

        if (!permit) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#013)"
            });
        }

        return res.status(200).json({ success: true, message: permit });

    } catch (error) {
        return res.status(500).json({
            success: false,
            messageTitle: "Error",
            messageText: "Tomar captura y favor de informar a soporte técnico. (#012)"
        });
    }
};

// editPermit : Colaborador : Done
exports.editPermit_postInfo = async (req, res) => {
    try {
        // Validate request fields
        const allowedFields = ["permitId", "filtro", "fechaInicio", "fechaTermino", "archivosSeleccionados", "files"];
        const receivedFields = Object.keys(req.body);
        
        if (receivedFields.some(field => !allowedFields.includes(field))) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#035)"
            });
        }

        const { permitId, filtro, fechaInicio, fechaTermino, archivosSeleccionados } = req.body;

        if ([permitId, filtro, fechaInicio, fechaTermino, archivosSeleccionados].some(
            field => typeof field !== "string") || !permitId) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#036)"
            });
        }

        const permitData = await permitsModel.findOne({
            _id: permitId,
            isSent: false,
            isVerified: false
        }).populate('docPaths', '_id filename originalname').select('-__v');

        if (!permitData) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar.(#034)"
            });
        }

        if (permitData.userId != res.locals.userId) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar.(#45)"
            });
        }

        // (skip) validate dates
        // (skip) validate dates
        // (skip) validate dates
   
        // First, add the new files._id into the payload
        const parsedFilesArray = JSON.parse(archivosSeleccionados);
        let paths = [];
        if (req.files && req.files.length > 0) {
            const docResponses = await Promise.all(
                req.files.map(file => filesModel.create(file))
            );
            paths = docResponses.map(doc => doc._id);
        }

        // Second, delete non-finalists and save the object for the finalists
        for (const item of permitData.docPaths) {
            const isFinalist = parsedFilesArray.find(file => file.name === item.originalname);
            if (!isFinalist) {
                const filePath = path.join(__dirname, '..', 'uploads', 'permisos', item.filename);
                try {
                    await fs.promises.unlink(filePath);
                    await filesModel.deleteOne({ _id: item._id });
                } catch (err) {
                    return res.status(500).json({
                        success: false,
                        messageTitle: "Error",
                        messageText: "Tomar captura y favor de informar a soporte técnico.(#055)"
                    });
                }
            } else {
                paths.push(item._id); // conservar los items previos porque es finalista pues
            }
        }


        // Update permit
        const payload = {
            ...(filtro && { filtro }),
            ...(fechaInicio && { fechaInicio: fechaInicio }),
            ...(fechaTermino && { fechaTermino: fechaTermino }),
            ...(paths.length > 0 && { docPaths: paths })
        };

        await permitsModel.findByIdAndUpdate(
            permitId,
            { $set: payload },
            { new: true }
        );

        return res.status(200).json({ success: true });

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#006)"
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            messageTitle: "Error",
            messageText: "Tomar captura y favor de informar a soporte técnico. (#040)"
        });
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
/****************/
/*********/
/***/

/* --- AUX --- */
const formatReadableDateTime = (isoDate) => {
    const date = new Date(isoDate);
    const readableDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const readableTime = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${readableDate}, ${readableTime}`;
};
/****************/
/*********/
/***/

/* --- VIEWS --- */
exports.accessPermitsModule = async (req, res) => {
    try {
        let permitsRows = "";

        // Permits module for "colaborador"
        if (res.locals.userPrivilege === "colaborador") {
            permitsRows = await permitsModel.find({ userId: res.locals.userId })
                .populate('docPaths', '_id originalname filename')
                .select('-__v');
            
            // Format dates for each permit
            permitsRows = permitsRows.map(permit => ({
                ...permit.toObject(),
                fechaInicio: formatReadableDateTime(permit.fechaInicio),
                fechaTermino: formatReadableDateTime(permit.fechaTermino)
            }));
            
            return res.render('permisos/colaboradorPermitsView.ejs', { permitsRows });

        // Permits module for "jefeInmediato"
        } else if (res.locals.userPrivilege === "jefeInmediato") {
            const team = await teamsSchema.find({ jefeInmediatoId: res.locals.userId }).select('-__v');
            if (team.length > 0) {
                const teamData = team[0];
                const permitPromises = teamData.colaboradoresIds.map(userId => {
                    return permitsModel.find({ userId: userId, isSent: true })
                        .populate('userId', 'nombre apellidoP apellidoM')
                        .populate('docPaths', '_id originalname filename path')
                        .select('-__v');
                });
                const permitsResults = await Promise.all(permitPromises);
                permitsRows = permitsResults.flat();
                
                // Format dates for each permit
                permitsRows = permitsRows.map(permit => ({
                    ...permit.toObject(),
                    fechaInicio: formatReadableDateTime(permit.fechaInicio),
                    fechaTermino: formatReadableDateTime(permit.fechaTermino)
                }));
            }
            return res.render('permisos/jefeInmediatoPermitsView.ejs', { permitsRows });

        // Permits module for "rHumanos" or "direccion"
        } else if (res.locals.userPrivilege === "rHumanos" || res.locals.userPrivilege === "direccion") {
            permitsRows = await permitsModel.find({ isSent: true })
                .populate('userId', 'nombre apellidoP apellidoM area')
                .populate('docPaths', '_id originalname filename path')
                .select('-__v');
            
            // Format dates for each permit
            permitsRows = permitsRows.map(permit => ({
                ...permit.toObject(),
                fechaInicio: formatReadableDateTime(permit.fechaInicio),
                fechaTermino: formatReadableDateTime(permit.fechaTermino)
            }));
            
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
/*********/
/***/