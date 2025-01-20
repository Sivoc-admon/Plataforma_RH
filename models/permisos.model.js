const mongoose = require('mongoose');

const permitSchema = new mongoose.Schema({
    userId: String,
    tipoPermiso: String,
    fechaInicio: String,
    fechaTermino: String,
    docPaths: [String], // Cambiado a un array de strings
    status: String,
});

// mongoose.model('permisos' = collection name)
module.exports = mongoose.model('permisos', permitSchema);
