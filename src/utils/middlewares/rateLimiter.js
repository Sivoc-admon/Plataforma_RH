// Rate Limiting
const rateLimit = require('express-rate-limit');
const generalLimiter = rateLimit({
    windowMs: 30 * 1000, // 1 minuto
    max: 999999, //18 on production // máximo N peticiones al endpoint por IP por minuto
    handler: (req, res, next) => {
        return res.status(429).json({
            success: false,
            message: 'Se excedió el número de intentos máximos, intenta nuevamente en unos segundos.',
        });
    }
});
module.exports = { generalLimiter };