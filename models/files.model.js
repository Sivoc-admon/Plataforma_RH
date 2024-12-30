const mongoose = require('mongoose');

// Establecer Esquema
const filesSchema = new mongoose.Schema({
    fieldname: String,
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: Number, 
});

module.exports = mongoose.model('archivos', filesSchema);

