const joi = require("joi");
const mongoose = require("mongoose");

// just avoid regex all toghteer. (FIXED)

const validator = (schema) => (payload) => 
    schema.validate(payload, { abortEarly: false });

/* 📌 Schema: changeStatus */
const changeStatus = joi.object({
    permitId: joi.string()
        .custom((value, helpers) => 
            mongoose.Types.ObjectId.isValid(value) ? value : helpers.error("any.invalid")
        )
        .required()
        .messages({ "any.invalid": "ID de permiso inválido." }),

    estatus: joi.string()
        .valid("Aprobado", "Pendiente", "Cancelado", "Justificado", "Injustificado")
        .required()
        .messages({ "any.only": "Estatus no válido." }),
});

exports.changeStatus = validator(changeStatus);






/* 📌 Schema 2: Users */
const usersSchema = joi.object({
    userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
        .messages({ "string.pattern.base": "ID de usuario inválido." }),

    docPaths: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/))
        .messages({ "string.pattern.base": "Uno o más IDs de documentos no son válidos." }),
});

// Exportar validaciones separadas
exports.validateUser = validator(usersSchema);
