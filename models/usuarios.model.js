const mongoose = require('mongoose');

// Establecer Esquema // TODO CONMSTRALEÑA??
const userSchema = new mongoose.Schema({
    email: String,
    password: String, //TODO alguna manera de guardarala encriptada pq si es posible
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

// Crear model ('usuarios' = collection name)
module.exports = mongoose.model('usuarios', userSchema);

