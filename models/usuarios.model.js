const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    rol: String,
    nombre: String,
    apellidoP: String,
    apellidoM: String,
    fechaBaja: Date,
    fechaIngreso: Date,
    area: String,
    foto: String,
    puesto: String,
    jefeInmediato: String,
    estaActivo: Boolean,
});

// mongoose.model('usuarios' = collection name)
module.exports = mongoose.model('usuarios', userSchema);

