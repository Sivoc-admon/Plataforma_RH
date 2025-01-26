const mongoose = require('mongoose');

// Establecer Esquema
const filesSchema = new mongoose.Schema({
    originalname: String,
    mimetype: String,
    filename: String,
    path: String,
    size: Number, 
});

module.exports = mongoose.model('archivos', filesSchema);

