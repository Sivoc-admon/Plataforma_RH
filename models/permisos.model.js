const mongoose = require('mongoose');

// Regex. Example "5 de febrero de 2025, 22:52"
const fechaRegex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d)$/;

// Schema
const permitSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'usuarios',  
        required: [true, 'El usuario es obligatorio'],
        validate: {
            validator: mongoose.Types.ObjectId.isValid,
            message: props => `${props.value} no es un ID válido`
        }
    }, 
    registro: { 
        type: String, 
        enum: ['Incapacidad', 'Permiso'], 
        required: [true, 'El registro es obligatorio']
    },
    filtro: { 
        type: String, 
        enum: ['Home Office', 'Cita Médica', 'Asunto Familiar', 'Otro'], 
        required: [true, 'El filtro es obligatorio']
    },
    fechaInicio: { 
        type: String, 
        required: [true, 'La fecha de inicio es obligatoria'],
        match: [fechaRegex, 'La fecha se encuentra en un formato incorrecto']
    },
    fechaTermino: { 
        type: String, 
        required: [true, 'La fecha de término es obligatoria'],
        match: [fechaRegex, 'La fecha se encuentra en un formato incorrecto']
    },
    docPaths: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'archivos' 
    }],
    estatus: { 
        type: String, 
        enum: ['Aprobado', 'Pendiente', 'Cancelado', 'Justificado', 'Injustificado'], 
        required: [true, 'El estatus es obligatorio']
    },
    isSent: { 
        type: Boolean, 
        required: true 
    },
    isVerified: { 
        type: Boolean, 
        required: true 
    },
});

// Exportation
module.exports = mongoose.model('permisos', permitSchema);
