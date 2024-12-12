const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Opciones de configuración
const options = {
    ssl: process.env.ssl === 'true'
};

// Función para conectarse a la base de datos
async function connnect_database() {
    try {
        await mongoose.connect(process.env.URI);
        console.log('Conexión exitosa a la base de datos.');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
    }
};

module.exports = connnect_database;