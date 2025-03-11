const usersModel = require("../models/usuarios.model");
const filesModel = require("../models/files.model");
const bcrypt = require("bcryptjs");
const teamsModel = require("../models/equipos.model");

const fs = require('fs');
const path = require('path');

const areaToPuestos = {
    "Administración": ["Director General", "Coordinador de Finanzas", "Gestora de Tesorería", "Coordinador de Recursos Humanos", "Gestor de Recursos Humanos", "Analista de Recursos Humanos"],
    "Ventas": ["Coordinador Comercial", "Gestor de Ventas", "Analista de Ventas"],
    "Calidad": ["Coordinador de Calidad", "Gestor de Calidad", "Analista de Calidad"],
    "Operativo": ["Coordinador Operacional", "Gestor de Ingeniería", "Analista de Ingeniería", "Gestor de Compras", "Analista de Compras", "Gestor de Manufactura", "Analista de Manufactura", "Analista de Almacén"],
    "Pruebas": ["Gestor de Pruebas", "Ingeniero de Servicio A", "Ingeniero de Servicio B", "Ingeniero de Servicio C"]
};


// addUser : rHumanos : Done 
exports.addUser = async (req, res) => {
    try {

        // 0. VALIDATE USER PRIVILEGES
        if (res.locals.userPrivilege !== "rHumanos") {
            return res.status(403).json({ 
                success: false, 
                messageTitle: "¡Repámpanos!", 
                messageText: "Espera un poco y vuelvelo a intentar. (#112)" 
            });
        }

        // A. MINIMAL PAYLOAD VALIDATION
        const { 
            nombre, apellidoP, apellidoM, email, password, 
            area, puesto, fechaIngreso, privilegio 
        } = req.body;

        // 1. Check if all required fields exist
        if (!nombre || !apellidoP || !apellidoM || !email || !password || 
            !area || !puesto || !fechaIngreso || !privilegio) {
            return res.status(400).json({ 
                success: false, 
                messageTitle: "Datos Incompletos", 
                messageText: "Todos los campos son requeridos." 
            });
        }

        if ( typeof nombre !== "string" ||  typeof apellidoP !== "string" ||  typeof apellidoM !== "string" ||  typeof email !== "string" ||  typeof password !== "string" || 
            typeof area !== "string" ||  typeof puesto !== "string" ||  typeof fechaIngreso !== "string" ||  typeof privilegio !== "string") {
            return res.status(400).json({ 
                success: false, 
                messageTitle: "Datos Incorrectos", 
                messageText: "Todos los campos deben tener un formato correcto." 
            });
        }

        // B. BUILD PAYLOAD
        // 1. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        let foto = "";
        if (req.files?.length > 0) {  // Validación segura de req.files
            const response = await filesModel.create(req.files[0]);
            if (!response) throw new Error("Error al guardar el archivo"); // Manejo correcto del error
            foto = response._id; // Asignación correcta del _id
        }

        // 2. Create user object
        const newUser = {
            nombre,
            apellidoP,
            apellidoM,
            email,
            password: hashedPassword,
            area,
            foto,
            puesto,
            fechaIngreso,
            privilegio,
            estaActivo: true
        };

        // 4. Save user to database - model validation happens here
        await usersModel.create(newUser);
        return res.status(200).json({ success: true });
        
    } catch (error) {
        //console.log(error);

        // Handle validation errors from Mongoose
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ 
                success: false, 
                messageTitle: "¡Repámpanos!", 
                messageText: "Espera un poco y vuelvelo a intentar. (#111)" 
            });
        }
        
        // Generic server error
        return res.status(500).json({ 
            success: false, 
            messageTitle: "Error", 
            messageText: "Tomar captura y favor de informar a soporte técnico. (#110)" 
        });
    }
};
// activateUser : rHumanos : Done
exports.activateUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) 
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "ID de usuario inválido." });

        // Execute findByIdAndUpdate
        const response = await usersModel.findByIdAndUpdate(
            userId,
            { $set: { estaActivo: true } }, // Change attribute
            { new: true, runValidators: true }
        );

        // If for some reason user not found, send 404
        if (!response) 
            return res.status(400).json({ success: false, messageTitle: "¡Repámpanos!", messageText: "Espera un poco y vuelvelo a intentar. (#173)" });
        
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, messageTitle: "Error", messageText: "Tomar captura y favor de informar a soporte técnico. (#174)" });
    }
};

/* --- AUX --- */
const formatReadableDateTime = (isoDate) => {
    if (isoDate == false) return "(Por definir)";
    const date = new Date(isoDate);
    const readableDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return `${readableDate}`;
};
/****************/
/*********/
/***/

/* --- VIEWS --- */
exports.accessUsersModule = async (req, res) => {
    try {
        let usersRows = "";

        if (res.locals.userPrivilege === "rHumanos" || res.locals.userPrivilege === "direccion") {
            usersRows = await usersModel.find({ estaActivo: true }).select('-password -__v');

            usersRows = usersRows.map(user => ({
                ...user.toObject(),
                fechaIngreso: formatReadableDateTime(user.fechaIngreso),
                fechaBaja: formatReadableDateTime(user.fechaBaja)
            }));

            return res.render('usuarios/rHumanosUsersView.ejs', { usersRows });
        } else {
            return res.redirect("/login");
        }

    } catch (error) {
        return res.status(500).send("Tomar captura y favor de informar a soporte técnico. (#071)");
    }
};
exports.restoreUsersView = async (req, res) => {
    try {
        let usersRows = "";

        if (res.locals.userPrivilege === "jefeInmediato") {

        } else if (res.locals.userPrivilege === "rHumanos" || res.locals.userPrivilege === "direccion") {
            usersRows = await usersModel.find({ estaActivo: false }).select('-email -foto -password -__v');

            usersRows = usersRows.map(user => ({
                ...user.toObject(),
                fechaIngreso: formatReadableDateTime(user.fechaIngreso),
                fechaBaja: formatReadableDateTime(user.fechaBaja)
            }));

            return res.render('usuarios/restoreUsersView.ejs', { usersRows });
        } else {
            return res.redirect("/login");
        }

    } catch (error) {
        return res.status(500).send("Tomar captura y favor de informar a soporte técnico. (#171)");
    }
};

exports.configureTeamView = async (req, res) => {
    try {
        let teamsRows = "";
        
        if (res.locals.userPrivilege === "rHumanos" || res.locals.userPrivilege === "direccion") {
            teamsRows = await teamsModel.find({}).populate('jefeInmediatoId colaboradoresIds', 'nombre apellidoP apellidoM area puesto').select('-password -fechaBaja -fechaIngreso -email -foto -__v');
            return res.render('usuarios/configureTeamView.ejs', { teamsRows });
        } else {
            return res.redirect("/login");
        }

    } catch (error) {
        return res.status(500).send("Tomar captura y favor de informar a soporte técnico. (#185)");
    }
};
/****************/
/*********/
/***/

/* --- MODEL LOGIC --- */
exports.doesEmailExists = async (req, res) => {
    try {
        const { email } = req.body;

        // Validación inicial: Comprueba que se envíe el email
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                messageTitle: "Email Inválido", 
                messageText: "El email es obligatorio." 
            });
        }

        // Validar formato de email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({ 
                success: false, 
                messageTitle: "Email Inválido", 
                messageText: "El formato del correo electrónico no es válido." 
            });
        }

        // Busca un usuario existente con el email
        const user = await usersModel.findOne({ email });

        // Si no hay usuario, responde con `exists: false`
        if (!user) return res.status(200).json({ success: true, exists: false });

        // Si el email ya existe, responde indicando que existe
        return res.status(200).json({ success: true, exists: true });

    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

exports.postEditUser = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Execute findByIdAndUpdate TODO
        /*
        const response = await usersModel.findByIdAndUpdate(
            userId, 
            { $set: { estaActivo: false } }, // Change attribute
            { new: true } , runValidators: true
        );
        */

        // If for some reason user not found, send 404
        if (!response) {
            return res.status(404).json({ success: false, message: "" });
        }

        activeUsers.delete(userId); // log him out 

        return res.status(200).json({ success: true, message: req.body });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }

};

exports.postFileUpload = async (req, res) => {
    try {
        const response = await filesModel.create(req.file);
        return res.status(200).json({ success: true, message: response }); // response.path = file location
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }
};

exports.postUserDeactivation = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Execute findByIdAndUpdate
        const response = await usersModel.findByIdAndUpdate(
            userId,
            { $set: { estaActivo: false } }, // Change attribute
            { new: true, runValidators: true }
        );

        // If for some reason user not found, send 404
        if (!response) return res.status(404).json({ success: false, message: "" });

        activeUsers.delete(userId); // log him out 
        return res.status(200).json({ success: true, message: "" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }
};




// TODO, add a new button that says change password, use the skeleton down below.
exports.postUserChangePrivilege = async (req, res) => {
    try {
        const userId = req.body.userId;
        const newPrivilege = req.body.newPrivilege

        // Execute findByIdAndUpdate
        const response = await usersModel.findByIdAndUpdate(
            userId,
            { $set: { privilegio: newPrivilege } }, // Change attribute
            { new: true, runValidators: true }
        );

        // if for some reason user not found, send 404
        if (!response) {
            return res.status(404).json({ success: false, message: "" });
        }

        // send correct execution
        activeUsers.delete(userId); // log him out 
        return res.status(200).json({ success: true, message: "" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
    }
};


// changeStatus : rHumanos : ---
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

// downloadPDF : rHumanos : --- 
// ALMOST, CORREGIR MARGENES Y LISTO
exports.downloadPDF = async (req, res) => {
    try {
        let usersRows = [];

        if (res.locals.userPrivilege === "rHumanos") {
            usersRows = await usersModel.find({}).select('-__v');

            if (usersRows.length === 0) return res.status(404).json({ success: false, message: 'No users found to export.' });
        } else {
            return res.redirect("/login");
        }

        // Create PDF with better styling - changed to portrait layout
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({
            margin: 30,
            size: 'Letter',
            layout: 'portrait' // Changed to portrait/vertical orientation
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=usuarios.pdf');
        doc.pipe(res);

        // Add header with company logo placeholder and title
        doc.fontSize(22)
            .fillColor('#2C3E50')
            .text('Reporte de Usuarios', 50, 30, { align: 'center' });

        doc.fontSize(12)
            .fillColor('#7F8C8D')
            .text('Generado el: ' + new Date().toLocaleDateString('es-MX'), 50, 60, { align: 'center' });

        // Table configuration - adjusted for portrait mode
        const startY = 100;
        const rowHeight = 30; // Reduced height for better fit in portrait
        // Adjusted column widths for portrait layout
        const columnWidths = [120, 130, 100, 100, 70];
        
        // Add horizontal line
        const startX = 30; // Starting point of the table
        const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0); // Sum of all columns

        doc.strokeColor('#BDC3C7')
            .lineWidth(1)
            .moveTo(startX, startY - 20)  
            .lineTo(startX + tableWidth, startY - 20) 
            .stroke();

        // Updated headers to match the actual data structure from comments
        const headers = ['Nombre completo', 'Correo', 'Área', 'Puesto', 'Activo'];
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

        // Draw table headers
        let currentX = startX;
        headers.forEach((header, i) => {
            // Draw header background
            drawCellBackground(currentX, currentY, columnWidths[i], rowHeight, '#34495E');

            // Calculate centered vertical position
            const textHeight = doc.heightOfString(header, { width: columnWidths[i] - 10 });
            const centeredY = currentY + (rowHeight - textHeight) / 2; // Center vertically

            // Draw header text
            doc.fillColor('#FFFFFF')
                .fontSize(11)
                .font('Helvetica-Bold')
                .text(
                    header,
                    currentX + 5, // Left margin
                    centeredY, // Centered Y coordinate
                    {
                        width: columnWidths[i] - 10,
                        align: 'center'
                    }
                );

            currentX += columnWidths[i]; // Move to next column
        });

        currentY += rowHeight;

        // Draw table rows for users based on the data structure in comments
        usersRows.forEach((user, index) => {
            currentX = startX;
            const isEvenRow = index % 2 === 0;
            const rowColor = isEvenRow ? '#F8F9F9' : '#FFFFFF';

            // Draw row background
            drawCellBackground(startX, currentY, tableWidth, rowHeight, rowColor);
            
            // Use the actual structure from the sample data in comments
            const rowData = [
                `${user.nombre || ''} ${user.apellidoP || ''} ${user.apellidoM || ''}`,
                user.email || 'N/A',
                user.area || 'N/A',
                user.puesto || 'N/A',
                user.estaActivo ? 'Sí' : 'No'
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
                        currentY + 5, // Adjusted positioning for smaller row height
                        {
                            width: columnWidths[i] - 10,
                            align: 'center',
                            lineBreak: false,
                            ellipsis: true
                        }
                    );

                currentX += columnWidths[i];
            });

            currentY += rowHeight;

            // Add new page if needed - adjusted page break point for portrait
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
                
                // Redraw headers on new page
                currentX = startX;
                headers.forEach((header, i) => {
                    drawCellBackground(currentX, currentY, columnWidths[i], rowHeight, '#34495E');
                    const textHeight = doc.heightOfString(header, { width: columnWidths[i] - 10 });
                    const centeredY = currentY + (rowHeight - textHeight) / 2;
                    
                    doc.fillColor('#FFFFFF')
                        .fontSize(11)
                        .font('Helvetica-Bold')
                        .text(
                            header,
                            currentX + 5,
                            centeredY,
                            {
                                width: columnWidths[i] - 10,
                                align: 'center'
                            }
                        );
                    currentX += columnWidths[i];
                });
                
                currentY += rowHeight;
            }
        });

        // Add footer - adjusted for portrait layout
        const pageBottom = 740;
        doc.strokeColor('#BDC3C7')
            .lineWidth(1)
            .moveTo(50, pageBottom)
            .lineTo(550, pageBottom)
            .stroke();

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};


// downloadExcel : rHumanos : --- 
exports.downloadExcel = async (req, res) => {
    const ExcelJS = require('exceljs');
    try {
        let usersRows = [];

        if (res.locals.userPrivilege === "rHumanos") {
            usersRows = await usersModel.find({})
            // if teamId return jefeInmediatoId
                // if jefeInmediatoId === userId, print "Usuario es J.I."
                // else, print jefeInmediatoId.name+apellidoP
            // else, return "N/A"
                .populate('userId', 'nombre apellidoP apellidoM area')
                .select('-__v');
        } else {
            return res.redirect("/login");
        }

        if (usersRows.length === 0) {
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
        res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};