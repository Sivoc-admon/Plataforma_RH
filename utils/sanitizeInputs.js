const mongoSanitize = require("mongo-sanitize");

// Global automatic mongoDB sanitization of all inputs (excluding files as in req.files)

const sanitizeInputs = (req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) 
        req.body = JSON.parse(JSON.stringify(req.body), (_, value) => mongoSanitize(value));
    if (req.params && Object.keys(req.params).length > 0) 
        req.params = JSON.parse(JSON.stringify(req.params), (_, value) => mongoSanitize(value));
    if (req.query && Object.keys(req.query).length > 0)
        req.query = JSON.parse(JSON.stringify(req.query), (_, value) => mongoSanitize(value));
    next();
};

module.exports = { sanitizeInputs };