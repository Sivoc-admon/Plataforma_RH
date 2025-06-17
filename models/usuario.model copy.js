const mongoose = require('mongoose');

// Constantes para validaciones
const COLLECTION_NAME = 'usuario'
const PRIVILEGE_TYPES = ['DIRECTIVO', 'JEFEINMEDIATO', 'PERSONALRRHH', 'COLABORADOR'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/;
const MIN_PASSWORD_LENGTH = 60; // Longitud típica de hash bcrypt
const MAX_PASSWORD_LENGTH = 72; // Longitud máxima de hash bcrypt

/**
 * Valida que el ObjectId sea válido de MongoDB.
 * @function
 * @param {string} id - ID a validar.
 * @returns {boolean} True si es un ObjectId válido, false en caso contrario.
 */
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Valida el formato de email usando expresión regular.
 * @function
 * @param {string} email - Email a validar.
 * @returns {boolean} True si el formato es válido, false en caso contrario.
 */
function isValidEmail(email) {
    return EMAIL_REGEX.test(email);
}

/**
 * Valida que la password tenga formato de hash bcrypt.
 * @function
 * @param {string} password - Password hasheada a validar.
 * @returns {boolean} True si tiene formato bcrypt válido, false en caso contrario.
 */
function isValidBcryptHash(password) {
    return BCRYPT_HASH_REGEX.test(password) && 
           password.length >= MIN_PASSWORD_LENGTH && 
           password.length <= MAX_PASSWORD_LENGTH;
}

/**
 * Schema de usuario con validaciones completas.
 * @const {mongoose.Schema}
 */
const usuarioSchema = new mongoose.Schema({
    idDatosPersonales: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'El ID de datos personales es obligatorio'],
        unique: true,
        trim: true,
        validate: {
            validator: isValidObjectId,
            message: 'El ID de datos personales debe ser un ObjectId válido de MongoDB'
        }
    },

    idDatosLaborales: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'El ID de datos laborales es obligatorio'],
        unique: true,
        trim: true,
        validate: {
            validator: isValidObjectId,
            message: 'El ID de datos laborales debe ser un ObjectId válido de MongoDB'
        }
    },

    idEquipo: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        trim: true,
        validate: {
            validator: isValidObjectId,
            message: 'El ID del equipo debe ser un ObjectId válido de MongoDB'
        }
    },

    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: [254, 'El email no puede exceder 254 caracteres'],
        validate: {
            validator: isValidEmail,
            message: 'El email debe tener un formato válido (ejemplo: usuario@dominio.com)'
        }
    },

    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        trim: true,
        minlength: [MIN_PASSWORD_LENGTH, `La contraseña hasheada debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`],
        maxlength: [MAX_PASSWORD_LENGTH, `La contraseña hasheada no puede exceder ${MAX_PASSWORD_LENGTH} caracteres`],
        validate: {
            validator: isValidBcryptHash,
            message: 'La contraseña debe estar hasheada con bcrypt en formato válido'
        }
    },

    privilegio: {
        type: String,
        required: [true, 'El privilegio es obligatorio'],
        enum: {
            values: PRIVILEGE_TYPES,
            message: `El privilegio debe ser uno de los siguientes: ${PRIVILEGE_TYPES.join(', ')}`
        },
        uppercase: true,
        trim: true
    },

    habilitado: {
        type: Boolean,
        required: [true, 'El estado habilitado es obligatorio'],
        default: true
    }
}, {
    versionKey: false,
    collection: COLLECTION_NAME
});

/**
 * Middleware pre-save para validaciones adicionales.
 * @function
 * @returns {void}
 */
usuarioSchema.pre('save', function(next) {
    // Validación adicional: verificar que el email no esté vacío después del trim
    if (!this.email || this.email.trim().length === 0) {
        return next(new Error('El email no puede estar vacío'));
    }

    // Validación adicional: verificar que el privilegio esté en mayúsculas
    if (this.privilegio) {
        this.privilegio = this.privilegio.toUpperCase();
    }

    next();
});

/**
 * Middleware pre-update para validaciones en actualizaciones.
 * @function
 * @returns {void}
 */
usuarioSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    const update = this.getUpdate();
    
    // Si se está actualizando el privilegio, asegurar que esté en mayúsculas
    if (update.privilegio) {
        update.privilegio = update.privilegio.toUpperCase();
    }

    // Si se está actualizando el email, asegurar que esté en minúsculas
    if (update.email) {
        update.email = update.email.toLowerCase();
    }

    next();
});

/**
 * Método para obtener información pública del usuario (sin contraseña).
 * @function
 * @returns {object} Objeto con información pública del usuario.
 */
usuarioSchema.methods.toPublicJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

/**
 * Método estático para buscar usuario por email.
 * @function
 * @param {string} email - Email del usuario a buscar.
 * @returns {Promise<object|null>} Usuario encontrado o null.
 */
usuarioSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase().trim() });
};

/**
 * Método estático para buscar usuarios por privilegio.
 * @function
 * @param {string} privilegio - Privilegio a buscar.
 * @returns {Promise<Array>} Array de usuarios con el privilegio especificado.
 */
usuarioSchema.statics.findByPrivilegio = function(privilegio) {
    return this.find({ privilegio: privilegio.toUpperCase() });
};

/**
 * Método estático para buscar usuarios habilitados.
 * @function
 * @returns {Promise<Array>} Array de usuarios habilitados.
 */
usuarioSchema.statics.findEnabled = function() {
    return this.find({ habilitado: true });
};

module.exports = mongoose.model(COLLECTION_NAME, usuarioSchema);