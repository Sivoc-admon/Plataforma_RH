const mongoose = require('mongoose');

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
            validator: (value) => validator.isEmail(value),  // Usa "validator" para validar el formato del email
            message: 'El email no tiene un formato válido', // Mensaje de error si el email no es válido
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
        trim: true,
        validate: {
            validator: function(v) {
                // Access area from this.area if it exists, otherwise try to use the area from the document being validated
                const area = this.area || this._area;
                if (!area || !areaToPuestos[area]) {
                    return false;
                }
                return areaToPuestos[area].includes(v);
            },
            message: props => `${props.value} no es un puesto válido para el área seleccionada`
        }
    },
    estaActivo: {
        type: Boolean,
        default: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'equipos',  // El modelo de usuario al que se hace referencia
        default: null,  // Permitir null al crear
        validate: {
            validator: function(value) {
                // Si el valor es null, es válido
                if (value === null) return true;
                // Validar que el valor sea un ObjectId
                return mongoose.Types.ObjectId.isValid(value);
            },
            message: 'teamId debe ser un ObjectId válido'
        }
    },
});

// Pre-validate middleware to store area for puesto validation
userSchema.pre('validate', function(next) {
    // Store area temporarily for the puesto validator
    if (this.area) {
        this._area = this.area;
    }
    next();
});

module.exports = mongoose.model('usuarios', userSchema);
