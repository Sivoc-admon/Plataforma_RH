const usersModel = require("../models/usuarios.model");
const filesModel = require("../models/files.model");
const bcrypt = require("bcryptjs");

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
// activateUser : rHumanos : -- 
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

        if (res.locals.userPrivilege === "jefeInmediato") {

        } else if (res.locals.userPrivilege === "rHumanos" || res.locals.userPrivilege === "direccion") {
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
        if (!response) {
            return res.status(404).json({ success: false, message: "" });
        }

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


// Output CSV file path
// TODO, remake
exports.postDownloadExcelUsers = async (req, res) => {
    const outputFilePath = './usuarios.xlsx';

    try {
        const usersRows = await usersModel.find().select('-__v -foto -password').lean();

        if (usersRows.length === 0) {
            return res.status(404).json({ success: false, message: 'No users found to export.' });
        }

        // Generate CSV from data
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(usersRows);

        // Write the file to disk
        fs.writeFileSync(outputFilePath, csv);

        // Send the file to the client
        return res.download(outputFilePath, 'usuarios.xlsx', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error sending file.' });
            }
        });

    } catch (error) {
        console.error('Error exporting users to CSV:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


// Output CSV file path
// TODO, remake
exports.postDownloadPDFUsers = async (req, res) => {
    try {
        const usersRows = await usersModel.find().select('-__v -foto -password').lean();

        if (usersRows.length === 0) {
            return res.status(404).json({ success: false, message: 'No users found to export.' });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        const outputFilePath = './usuarios.pdf';

        // Escribir el archivo PDF en el sistema de archivos
        const stream = fs.createWriteStream(outputFilePath);
        doc.pipe(stream);

        // Añadir título
        doc.fontSize(20).text('Lista de Usuarios', { align: 'center' });
        doc.moveDown();

        // Añadir encabezados de la tabla
        const headers = ['Nombre', 'Apellido Paterno', 'Apellido Materno', 'Fecha de Ingreso', 'Área', 'Puesto', 'Activo'];
        doc.fontSize(12).text(headers.join(' | '), { align: 'left' });
        doc.moveDown();

        // Añadir filas de usuarios
        usersRows.forEach(user => {
            const row = [
                user.nombre,
                user.apellidoP,
                user.apellidoM,
                new Date(user.fechaIngreso).toLocaleDateString(),
                user.area,
                user.puesto,
                user.estaActivo ? 'Sí' : 'No'
            ];
            doc.text(row.join(' | '), { align: 'left' });
        });

        // Finalizar el documento y esperar a que se cierre el stream
        doc.end();

        stream.on('finish', () => {
            return res.download(outputFilePath, 'usuarios.pdf', err => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Error sending file.' });
                }
            });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};