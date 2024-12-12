const mongoose = require('mongoose');

// Establecer Esquema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Crear model ('usuarios' = collection name)
module.exports = mongoose.model('usuarios', userSchema);
