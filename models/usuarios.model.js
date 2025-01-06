const mongoose = require('mongoose');

// Establecer Esquema
const userSchema = new mongoose.Schema({
    email: String,
    nombre: String,
    apellidoP: String,
    apellidoM: String,
    fechaBaja: Date,
    fechaIngreso: Date,
    area: String,
    foto: String,
    puesto: String,
    jefeInmediato: String,
});

// Crear model ('usuarios' = collection name)
module.exports = mongoose.model('usuarios', userSchema);

