const mongoose = require('mongoose');

const fechaRegex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d)$/;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    privilegio: {
        type: String,
        enum: ['jefeInmediato', 'colaborador', 'rHumanos', 'direccion'],
        required: [true, 'El privilegio es obligatorio']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    apellidoP: {
        type: String,
        required: [true, 'El apellido paterno es obligatorio'],
        trim: true
    },
    apellidoM: {
        type: String,
        required: [true, 'El apellido materno es obligatorio'],
        trim: true
    },
    fechaBaja: { // console.log("" == false); // true
        type: String,
        match: [fechaRegex, 'La fecha de baja debe estar en formato correcto'],
        default: null
    },
    fechaIngreso: {
        type: String,
        required: [true, 'La fecha de ingreso es obligatoria'],
        match: [fechaRegex, 'La fecha de ingreso debe estar en formato correcto']
    },
    area: {
        type: String,
        required: [true, 'El área es obligatoria'],
        trim: true
    },
    foto: {
        type: String,
        default: ''
    },
    puesto: {
        type: String,
        required: [true, 'El puesto es obligatorio'],
        trim: true
    },
    jefeInmediato: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios',
        validate: {
            validator: mongoose.Types.ObjectId.isValid,
            message: props => `${props.value} no es un ID válido`
        }
    },
    estaActivo: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('usuarios', userSchema);