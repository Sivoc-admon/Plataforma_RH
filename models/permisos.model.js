const mongoose = require('mongoose');

const permitSchema = new mongoose.Schema({
    userId: String,
    tipoPermiso: String,
    fechaInicio: String,
    fechaTermino: String,
    docPaths: [String], // String array
    estatus: String,
    isSent: Boolean,
    isVerified: Boolean,
});

// mongoose.model('permisos' = collection name)
module.exports = mongoose.model('permisos', permitSchema);
