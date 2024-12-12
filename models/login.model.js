const mongoose = require('mongoose');

// Establecer Esquema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Crear model
module.exports = mongoose.model('usuarios', userSchema, 'collection_name'); // Specify the correct collection name
