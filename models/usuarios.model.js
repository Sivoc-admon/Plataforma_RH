const mongoose = require('mongoose');
const validator = require('validator');

const fechaRegex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d)$/;

// Moved the area-puesto relationship config to the model file
const areaToPuestos = {
    "Administración": ["Director General", "Coordinador de Finanzas", "Gestora de Tesorería", "Coordinador de Recursos Humanos", "Gestor de Recursos Humanos", "Analista de Recursos Humanos"],
    "Ventas": ["Coordinador Comercial", "Gestor de Ventas", "Analista de Ventas"],
    "Calidad": ["Coordinador de Calidad", "Gestor de Calidad", "Analista de Calidad"],
    "Operativo": ["Coordinador Operacional", "Gestor de Ingeniería", "Analista de Ingeniería", "Gestor de Compras", "Analista de Compras", "Gestor de Manufactura", "Analista de Manufactura", "Analista de Almacén"],
    "Pruebas": ["Gestor de Pruebas", "Ingeniero de Servicio A", "Ingeniero de Servicio B", "Ingeniero de Servicio C"]
};

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'El email no tiene un formato válido',
        }
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'], 
    },
    privilegio: {
        type: String,
        enum: {
            values: ['jefeInmediato', 'colaborador', 'rHumanos', 'direccion'],
            message: 'El privilegio seleccionado no es válido'
        },
        required: [true, 'El privilegio es obligatorio']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        validate: {
            validator: function(v) {
                return !/[\{\}\:\$\=\'\*\[\]]/.test(v);
            },
            message: props => `El nombre contiene caracteres no permitidos`
        }
    },
    apellidoP: {
        type: String,
        required: [true, 'El apellido paterno es obligatorio'],
        trim: true,
        validate: {
            validator: function(v) {
                return !/[\{\}\:\$\=\'\*\[\]]/.test(v);
            },
            message: props => `El apellido paterno contiene caracteres no permitidos`
        }
    },
    apellidoM: {
        type: String,
        required: [true, 'El apellido materno es obligatorio'],
        trim: true,
        validate: {
            validator: function(v) {
                return !/[\{\}\:\$\=\'\*\[\]]/.test(v);
            },
            message: props => `El apellido materno contiene caracteres no permitidos`
        }
    },
    fechaBaja: {
        type: String,
        default: ""
    },
    fechaIngreso: {
        type: String,
        required: [true, 'La fecha de ingreso es obligatoria'],
        match: [fechaRegex, 'La fecha de ingreso debe estar en formato correcto']
    },
    area: {
        type: String,
        required: [true, 'El área es obligatoria'],
        trim: true,
        validate: {
            validator: function(v) {
                return Object.keys(areaToPuestos).includes(v);
            },
            message: props => `${props.value} no es un área válida`
        }
    },
    foto: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'archivos',
        default: null
    },
    puesto: {
        type: String,
        required: [true, 'El puesto es obligatorio'],
        trim: true
    },
    estaActivo: {
        type: Boolean,
        default: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'equipos',
        default: null,
        validate: {
            validator: function(value) {
                if (value === null) return true;
                return mongoose.Types.ObjectId.isValid(value);
            },
            message: 'teamId debe ser un ObjectId válido'
        }
    },
});

// Custom validation for puesto-area relationship
userSchema.path('puesto').validate({
    validator: async function(puesto) {
        // For new documents, use the area from this document
        let area = this.area;
        
        // For updates, if area is not provided, get it from the database
        if (!area && this._update) {
            // If updating and area is provided in the update
            if (this._update.$set && this._update.$set.area) {
                area = this._update.$set.area;
            } else {
                // If no area in update, get the current area from database
                try {
                    const doc = await mongoose.model('usuarios').findOne(this.getQuery());
                    if (doc) {
                        area = doc.area;
                    }
                } catch (err) {
                    return false;
                }
            }
        }
        
        // Validate puesto against area
        if (!area || !areaToPuestos[area]) {
            return false;
        }
        return areaToPuestos[area].includes(puesto);
    },
    message: props => `${props.value} no es un puesto válido para el área seleccionada`
});

module.exports = mongoose.model('usuarios', userSchema);