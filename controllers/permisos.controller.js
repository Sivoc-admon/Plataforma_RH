const filesModel = require("../models/files.model");
const permitsModel = require("../models/permisos.model");
const teamsSchema = require("../models/equipos.model");
const path = require('path');
const fs = require('fs');

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
        const updateResponse = await permitsModel.findByIdAndUpdate(permitId, { $set: { isSent: true } }, { new: true, runValidators: true });
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

// editPermit : Colaborador : Done (2 skips)
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

        // (skip) validate filtro
        // (skip) validate filtro
        // (skip) validate filtro

        // (skip) validate dates
        // (skip) validate dates
        // (skip) validate dates

        let paths = [];
        const dataArray = permitData.docPaths;
        const parsedFilesArray = JSON.parse(archivosSeleccionados);
        const reqFilesObject = req.files;

        // First, process each item in dataArray (current files in DB)
        for (const item of dataArray) {
            // Check if this file is being replaced by a new upload
            const isBeingReplaced = reqFilesObject.some(file => file.originalname === item.originalname);
            // Check if this file was selected to keep
            const isSelected = parsedFilesArray.some(file => file.name === item.originalname);

            // Delete if:
            // - File is being replaced by new upload OR
            // - File wasn't selected to keep
            if (isBeingReplaced || !isSelected) {
                console.log("Deleting: ", item);
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
                // Keep file if it's selected and not being replaced
                paths.push(item);
            }
        }

        // Add new files to paths
        if (req.files && req.files.length > 0) {
            const docResponses = await Promise.all(
                req.files.map(file => filesModel.create(file))
            );
            paths = [...paths, ...docResponses];  // Combine old and new files
        }

        const payload = {
            ...(filtro && { filtro }),
            ...(fechaInicio && { fechaInicio: fechaInicio }),
            ...(fechaTermino && { fechaTermino: fechaTermino }),
            ...(paths.length > 0 && { docPaths: paths })
        };

        await permitsModel.findByIdAndUpdate(
            permitId,
            { $set: payload },
            { new: true, runValidators: true }
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

// changeStatus : jefeInmediato, rHumanos : Done
exports.changeStatus = async (req, res) => {
    try {
        const { permitId, estatus } = req.body;

        // 1. Verify request quality
        if (!permitId || typeof permitId !== "string" || !estatus || typeof estatus !== "string") {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#035)"
            });
        }

        // 2. Get current permit data and validate if the new estatus
        const permitData = await permitsModel.findOne({ _id: permitId });

        if (!permitData) return res.status(400).json({
            success: false,
            messageTitle: "¡Repámpanos!",
            messageText: "Espera un poco y vuelvelo a intentar. (#058)"
        });

        if (!permitData.isSent || permitData.isVerified) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#055)"
            });
        }

        // 3. Execute mongoose action 
        const updatedPermit = await permitsModel.findByIdAndUpdate(
            permitId,
            {
                $set: {
                    estatus: estatus,
                }
            },
            { new: true, runValidators: true }
        );
        if (!updatedPermit) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#059)"
            });
        }

        return res.status(200).json({ success: true, message: "" });

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#057)"
            });
        }
        return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#060)" });
    }
};

// verifyPermit : jefeInmediato, rHumanos : Done
exports.verifyPermit = async (req, res) => {
    try {
        const { permitId } = req.body;

        // 1. Verify request quality
        if (!permitId || typeof permitId !== "string") {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#068)"
            });
        }

        // 2. Get current permit data and validate if the new estatus
        const permitData = await permitsModel.findOne({ _id: permitId });

        if (!permitData) return res.status(400).json({
            success: false,
            messageTitle: "¡Repámpanos!",
            messageText: "Espera un poco y vuelvelo a intentar. (#067)"
        });

        if (!permitData.isSent || permitData.isVerified) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#066)"
            });
        }

        // 3. Execute mongoose action 
        const updatedPermit = await permitsModel.findByIdAndUpdate(
            permitId,
            {
                $set: {
                    isVerified: true,
                }
            },
            { new: true, runValidators: true }
        );
        if (!updatedPermit) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#065)"
            });
        }

        return res.status(200).json({ success: true, message: "" });

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                messageTitle: "¡Repámpanos!",
                messageText: "Espera un poco y vuelvelo a intentar. (#069)"
            });
        }
        return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#070)" });
    }

};

// downloadPDF : jefeInmediato, rHumanos : Done 
exports.downloadPDF = async (req, res) => {
    try {
        let permitsRows = "";

        // Permits module for "jefeInmediato"
        if (res.locals.userPrivilege === "jefeInmediato") {
            // get all members from the team, map all their permits in a single array
            const team = await teamsSchema.find({ jefeInmediatoId: res.locals.userId }).select('-__v');
            if (team.length > 0) {
                const teamData = team[0];
                const permitPromises = teamData.colaboradoresIds.map(userId => {
                    return permitsModel.find({ userId: userId, isSent: true })
                        .populate('userId', 'nombre apellidoP apellidoM area')
                        .populate('docPaths', '_id originalname filename path')
                        .select('-__v');
                });
                const permitsResults = await Promise.all(permitPromises);
                permitsRows = permitsResults.flat();
            }

            if (permitsRows.length === 0) {
                return res.status(404).json({ success: false, message: 'No users found to export.' });
            }

            // Permits module for "rHumanos"
        } else if (res.locals.userPrivilege === "rHumanos") {
            permitsRows = await permitsModel.find({ isSent: true })
                .populate('userId', 'nombre apellidoP apellidoM area')
                .populate('docPaths', '_id originalname filename path')
                .select('-__v');

            if (permitsRows.length === 0) {
                return res.status(404).json({ success: false, message: 'No users found to export.' });
            }
        } else {
            return res.redirect("/login");
        }

        // Create PDF with better styling
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({
            margin: 30,
            size: 'Letter',
            layout: 'landscape'
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=permisos.pdf');
        doc.pipe(res);

        // Add header with company logo placeholder and title
        doc.fontSize(22)
            .fillColor('#2C3E50')
            .text('Reporte de Permisos', 50, 30, { align: 'center' });

        doc.fontSize(12)
            .fillColor('#7F8C8D')
            .text('Generado el: ' + new Date().toLocaleDateString('es-MX'), 50, 60, { align: 'center' });

        // Table configuration
        const startY = 100;
        const rowHeight = 54;
        const columnWidths = [90, 90, 90, 90, 90, 90, 90, 90];
        // Add horizontal line
        const startX = 39; // Punto de inicio de la tabla
        const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0); // Suma de todas las columnas

        doc.strokeColor('#BDC3C7')
            .lineWidth(1)
            .moveTo(startX, startY - 20)  // Línea justo arriba de la tabla
            .lineTo(startX + tableWidth, startY - 20) // Final de la línea según el ancho total de la tabla
            .stroke();

        // 
        const headers = ['Nombre del colaborador', 'Área del colaborador', 'Descripción del permiso', 'Fecha y hora de inicio', 'Fecha y hora de término', 'Documentos agregados', 'Estatus actual del permiso', 'Estado de verificación'];
        let currentY = startY;

        // Function to draw cell background
        function drawCellBackground(x, y, width, height, color) {
            doc.fillColor(color)
                .rect(x, y, width, height)
                .fill();
        }

        // Function to draw cell borders
        function drawCellBorders(x, y, width, height) {
            doc.strokeColor('#E0E0E0')
                .lineWidth(1)
                .rect(x, y, width, height)
                .stroke();
        }

        // Dibujar encabezados de la tabla
        let currentX = startX;
        headers.forEach((header, i) => {
            // Dibujar fondo del encabezado
            drawCellBackground(currentX, currentY, columnWidths[i], rowHeight, '#34495E');

            // Calcular la posición vertical centrada
            const textHeight = doc.heightOfString(header, { width: columnWidths[i] - 10 });
            const centeredY = currentY + (rowHeight - textHeight) / 2; // Centrar verticalmente

            // Dibujar texto del encabezado
            doc.fillColor('#FFFFFF')
                .fontSize(11)
                .font('Helvetica-Bold')
                .text(
                    header,
                    currentX + 5, // Margen izquierdo
                    centeredY, // Coordenada Y centrada
                    {
                        width: columnWidths[i] - 10,
                        align: 'center'
                    }
                );

            currentX += columnWidths[i]; // Avanzar a la siguiente columna
        });

        currentY += rowHeight;

        // Draw table rows
        permitsRows.forEach((permit, index) => {
            currentX = startX;
            const isEvenRow = index % 2 === 0;
            const rowColor = isEvenRow ? '#F8F9F9' : '#FFFFFF';

            // Draw row background
            drawCellBackground(50, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight, rowColor);

            // Draw cell data
            const rowData = [
                `${permit.userId.nombre} ${permit.userId.apellidoP} ${permit.userId.apellidoM}`,
                permit.userId.area,
                `${permit.registro} para ${permit.filtro}`,
                formatReadableDateTime(permit.fechaInicio),
                formatReadableDateTime(permit.fechaTermino),
                permit.docPaths?.length ? permit.docPaths.map(doc => doc.originalname).join(', ') : 'No hay documentos',
                permit.estatus,
                permit.isVerified ? 'Interacción cerrado' : 'Interacción abierto'
            ];

            rowData.forEach((text, i) => {
                // Draw cell borders
                drawCellBorders(currentX, currentY, columnWidths[i], rowHeight);

                // Draw cell text
                doc.fillColor('#2C3E50')
                    .fontSize(10)
                    .font('Helvetica')
                    .text(
                        text,
                        currentX + 5,
                        currentY + rowHeight / 6,
                        {
                            width: columnWidths[i] - 12,
                            align: 'center',
                            lineBreak: false,
                            ellipsis: true
                        }
                    );

                currentX += columnWidths[i];
            });

            currentY += rowHeight;

            // Add new page if needed
            if (currentY > 500) {
                doc.addPage();
                currentY = 50;
            }
        });

        // Add footer
        const pageBottom = 550;
        doc.strokeColor('#BDC3C7')
            .lineWidth(1)
            .moveTo(50, pageBottom)
            .lineTo(750, pageBottom)
            .stroke();

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};

// downloadExcel : jefeInmediato, rHumanos : Done 
exports.downloadExcel = async (req, res) => {
    const ExcelJS = require('exceljs');
    try {
        let permitsRows = [];

        if (res.locals.userPrivilege === "jefeInmediato") {
            const team = await teamsSchema.find({ jefeInmediatoId: res.locals.userId }).select('-__v');
            if (team.length > 0) {
                const teamData = team[0];
                const permitPromises = teamData.colaboradoresIds.map(userId => {
                    return permitsModel.find({ userId: userId, isSent: true })
                        .populate('userId', 'nombre apellidoP apellidoM area')
                        .populate('docPaths', '_id originalname filename path')
                        .select('-__v');
                });
                const permitsResults = await Promise.all(permitPromises);
                permitsRows = permitsResults.flat();
            }
        } else if (res.locals.userPrivilege === "rHumanos") {
            permitsRows = await permitsModel.find({ isSent: true })
                .populate('userId', 'nombre apellidoP apellidoM area')
                .populate('docPaths', '_id originalname filename path')
                .select('-__v');
        } else {
            return res.redirect("/login");
        }

        if (permitsRows.length === 0) {
            return res.status(404).json({ success: false, message: 'No users found to export.' });
        }

        // 📌 Crear un nuevo archivo Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Permisos');

        // 📌 Definir encabezados
        worksheet.columns = [
            { header: 'Nombre del colaborador', key: 'nombre', width: 25 },
            { header: 'Área', key: 'area', width: 20 },
            { header: 'Descripción del permiso', key: 'descripcion', width: 30 },
            { header: 'Fecha y hora de inicio', key: 'fechaInicio', width: 25 },
            { header: 'Fecha y hora de término', key: 'fechaTermino', width: 25 },
            { header: 'Documentos agregados', key: 'documentos', width: 30 },
            { header: 'Estatus', key: 'estatus', width: 20 },
            { header: 'Estado de verificación', key: 'verificacion', width: 20 }
        ];

        // 📌 Llenar las filas con los datos
        permitsRows.forEach(permit => {
            worksheet.addRow({
                nombre: `${permit.userId.nombre} ${permit.userId.apellidoP} ${permit.userId.apellidoM}`,
                area: permit.userId.area,
                descripcion: `${permit.registro} para ${permit.filtro}`,
                fechaInicio: formatReadableDateTime(permit.fechaInicio),
                fechaTermino: formatReadableDateTime(permit.fechaTermino),
                documentos: permit.docPaths?.length ? permit.docPaths.map(doc => doc.originalname).join(', ') : 'No hay documentos',
                estatus: permit.estatus,
                verificacion: permit.isVerified ? 'Interacción cerrada' : 'Interacción abierta'
            });
        });

        // 📌 Aplicar estilos al encabezado
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34495E' } };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // 📌 Configurar las respuestas HTTP
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=permisos.xlsx');

        // 📌 Enviar el archivo
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
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
                        .populate('userId', 'nombre apellidoP apellidoM area')
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