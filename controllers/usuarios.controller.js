// Importar el modelo para utilizarlo
const usersModel = require("../models/usuarios.model");
const filesModel = require("../models/files.model");
const bcrypt = require("bcryptjs");
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit'); // Asegúrate de tener instalada esta biblioteca
const fs = require('fs');


// TODO, cleanup after 80% backend framework


/* --- MODEL LOGIC --- */

exports.postEmailExists = async (req, res) => {
    try {
        const response = await usersModel.findOne({ email: req.body.email });
        if (!response) {
            return res.status(200).json({ success: true, exists: false });
        }
        return res.status(200).json({ success: true, exists: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, exists: false });
    }
};

exports.postAddUser = async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10); // password encryption          
        const response = await usersModel.create(req.body);
        return res.status(200).json({ success: true, message: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "" });
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
            return res.status(404).json({success: false, message: "" });
        }

        activeUsers.delete(userId); // log him out 

        return res.status(200).json({success: true, message: req.body});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
    }


};

exports.postFileUpload = async (req, res) => {
    try {
        const response = await filesModel.create(req.file);
        return res.status(200).json({success: true, message: response}); // response.path = file location
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
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
            return res.status(404).json({success: false, message: "" });
        }

        activeUsers.delete(userId); // log him out 
        return res.status(200).json({success: true, message: ""});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
    }
};

exports.postUserActivation = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Execute findByIdAndUpdate
        const response = await usersModel.findByIdAndUpdate(
            userId, 
            { $set: { estaActivo: true } }, // Change attribute
            { new: true, runValidators: true } 
        );

        // If for some reason user not found, send 404
        if (!response) {
            return res.status(404).json({success: false, message: "" });
        }

        return res.status(200).json({success: true, message: ""});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
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
            { new: true , runValidators: true } 
        );

        // if for some reason user not found, send 404
        if (!response) {
            return res.status(404).json({success: false, message: "" });
        }

        // send correct execution
        activeUsers.delete(userId); // log him out 
        return res.status(200).json({success: true, message: ""});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "" });
    }
};

/* --- VIEWS LOGIC --- */
exports.getUsersView = async (req, res) => {
    try {
        const usersRows = await usersModel.find({ estaActivo: true }).select('-password -__v');
        return res.render('usuarios/usuarios.ejs', { usersRows });
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
    }
};

exports.getRestoreUsersView = async (req, res) => {
    try {
        const usersRows = await usersModel.find({ estaActivo: false }).select('-email -foto -password -__v');
        return res.render('usuarios/restoreUsersView.ejs', { usersRows });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Algo salió mal. Favor de contactar a soporte técnico.');
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