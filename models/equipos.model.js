const mongoose = require('mongoose');

const teamsSchema = new mongoose.Schema({
    jefeInmediatoId: String,
    colaboradoresIds: [String], // Cambiado a un array de strings
});

// mongoose.model('equipos' = collection name)
module.exports = mongoose.model('equipos', teamsSchema);
