const usersModel = require('../models/usuarios.model');
const filesModel = require('../models/files.model');
const bcrypt = require('bcryptjs');
const teamsModel = require('../models/equipos.model');

/**
 * Endpoint para cuando se desea añadir un nuevo usuario
 * 
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 */
exports.addUser = async (request, response) => {
    try {

        // skip . if a validation triggers after the multer, the file must be deleted to avoid multiple file injections without user creation

        // 0. VALIDATE USER PRIVILEGES

        if (response.locals.userPrivilege !== 'rHumanos' &&
            response.locals.userPrivilege !== 'direccion') {
            return response.status(403).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Espera un poco y vuelvelo a intentar. (#112)'
            });
        }

        // A. MINIMAL PAYLOAD VALIDATION
        const {
            nombre, apellidoP, apellidoM, email, password,
            area, puesto, fechaIngreso, privilegio
        } = request.body;

        // 1. Check if all required fields exist
        if (!nombre || !apellidoP || !apellidoM || !email || !password ||
            !area || !puesto || !fechaIngreso || !privilegio) {
            return response.status(400).json({
                success: false,
                messageTitle: 'Datos Incompletos',
                messageText: 'Todos los campos son requeridos.'
            });
        }

        if (typeof nombre !== 'string' || typeof apellidoP !== 'string' || typeof apellidoM !== 'string' || typeof email !== 'string' || typeof password !== 'string' ||
            typeof area !== 'string' || typeof puesto !== 'string' || typeof fechaIngreso !== 'string' || typeof privilegio !== 'string') {
            return response.status(400).json({
                success: false,
                messageTitle: 'Datos Incorrectos',
                messageText: 'Todos los campos deben tener un formato correcto.'
            });
        }

        // B. BUILD PAYLOAD
        // 1. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        let foto = '';
        if (request.files?.length > 0) {  // Validación segura de req.files
            const response = await filesModel.create(request.files[0]);
            if (!response) { throw new Error('Error al guardar el archivo'); } // Manejo correcto del error
            foto = response._id; // Asignación correcta del _id
        }

        // 2. Create user object
        const newUser = {
            nombre,
            apellidoP,
            apellidoM,
            email,
            password: hashedPassword,
            area,
            foto,
            puesto,
            fechaIngreso,
            privilegio,
            estaActivo: true
        };

        // 4. Save user to database - model validation happens here
        await usersModel.create(newUser);

        // if jefe inmediato created, 
        return response.status(200).json({ success: true });

    } catch (error) {
        console.log(error);

        // Handle validation errors from Mongoose
        if (error instanceof mongoose.Error.ValidationError) {
            return response.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Espera un poco y vuelvelo a intentar. (#111)'
            });
        }

        // Generic server error
        return response.status(500).json({
            success: false,
            messageTitle: 'Error',
            messageText: 'Tomar captura y favor de informar a soporte técnico. (#110)'
        });
    }
};

// activateUser : rHumanos : Done
/**
 *
 * @param request
 * @param response
 */
exports.activateUser = async (request, response) => {
    try {

        const userId = request.body.userId;
        // Input validation
        if (!userId) {
            return response.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'El ID de usuario es requerido.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).json(
                {
                    success: false,
                    messageTitle: '¡Repámpanos!',
                    messageText: 'ID de usuario inválido.'
                });
        }

        // Execute findByIdAndUpdate
        const response = await usersModel.findByIdAndUpdate(
            userId,
            { $set: { estaActivo: true } },
            { new: true, runValidators: true }
        );

        // If for some reason user not found, send 404
        if (!response) { return response.status(400).json({ success: false, messageTitle: '¡Repámpanos!', messageText: 'Espera un poco y vuelvelo a intentar. (#173)' }); }

        return response.status(200).json({ success: true });
    } catch (error) {
        return response.status(500).json({ success: false, messageTitle: 'Error', messageText: 'Tomar captura y favor de informar a soporte técnico. (#174)' });
    }
};

/* --- AUX --- */
/**
 *
 * @param isoDate
 */
const formatReadableDateTime = (isoDate) => {
    if (!isoDate) { return '(Por definir)'; }
    const date = new Date(isoDate);
    const readableDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return `${readableDate}`;
};
/****************/
/*********/
/***/

/* --- VIEWS --- */
/**
 *
 * @param request
 * @param response
 */
exports.accessUsersModule = async (request, response) => {
    try {
        let usersRows = '';
        let theRoot = false;


        if (response.locals.userPrivilege === 'rHumanos' || response.locals.userPrivilege === 'direccion') {
            usersRows = await usersModel.find({ estaActivo: true }).select('-password -__v');

            usersRows = usersRows.map(user => ({
                ...user.toObject(),
                fechaIngreso: formatReadableDateTime(user.fechaIngreso),
                fechaBaja: formatReadableDateTime(user.fechaBaja)
            }));

            if (response.locals.userId === '000') { theRoot = true; }

            return response.render('usuarios/rHumanosUsersView.ejs', { usersRows, theRoot });
        } else {
            return response.redirect('/login');
        }

    } catch (error) {
        return response.status(500).send('Tomar captura y favor de informar a soporte técnico. (#071)');
    }
};
/**
 *
 * @param request
 * @param response
 */
exports.restoreUsersView = async (request, response) => {
    try {
        let usersRows = '';

        if (response.locals.userPrivilege === 'rHumanos' || response.locals.userPrivilege === 'direccion') {
            usersRows = await usersModel.find({ estaActivo: false }).select('-email -foto -password -__v');

            usersRows = usersRows.map(user => ({
                ...user.toObject(),
                fechaIngreso: formatReadableDateTime(user.fechaIngreso),
                fechaBaja: formatReadableDateTime(user.fechaBaja)
            }));

            return response.render('usuarios/restoreUsersView.ejs', { usersRows });
        } else {
            return response.redirect('/login');
        }

    } catch (error) {
        return response.status(500).send('Tomar captura y favor de informar a soporte técnico. (#171)');
    }
};
/**
 *
 * @param request
 * @param response
 */
exports.configureTeamView = async (request, response) => {
    try {
        let teamsRows = '';

        if (response.locals.userPrivilege === 'rHumanos' || response.locals.userPrivilege === 'direccion') {
            // Updated to use the new schema structure with jefeInmediatoIds as an array
            teamsRows = await teamsModel.find({})
                .populate({
                    path: 'jefeInmediatoIds',
                    select: 'nombre apellidoP apellidoM area puesto'
                })
                .populate({
                    path: 'colaboradoresIds',
                    select: 'nombre apellidoP apellidoM area puesto'
                })
                .select('-password -fechaBaja -fechaIngreso -email -foto -__v');

            return response.render('usuarios/configureTeamView.ejs', { teamsRows });
        } else {
            return response.redirect('/login');
        }

    } catch (error) {
        console.error('Error in configureTeamView:', error);
        return response.status(500).send('Tomar captura y favor de informar a soporte técnico. (#185)');
    }
};
/****************/
/*********/
/***/

/* --- MODEL LOGIC --- */
/**
 *
 * @param request
 * @param response
 */
exports.doesEmailExists = async (request, response) => {
    try {
        const { email } = request.body;

        // Validación inicial: Comprueba que se envíe el email
        if (!email) {
            return response.status(400).json({
                success: false,
                messageTitle: 'Email Inválido',
                messageText: 'El email es obligatorio.'
            });
        }

        // Validar formato de email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return response.status(400).json({
                success: false,
                messageTitle: 'Email Inválido',
                messageText: 'El formato del correo electrónico no es válido.'
            });
        }

        // Busca un usuario existente con el email
        const user = await usersModel.findOne({ email });

        // Si no hay usuario, responde con `exists: false`
        if (!user) { return response.status(200).json({ success: true, exists: false }); }

        // Si el email ya existe, responde indicando que existe
        return response.status(200).json({ success: true, exists: true });

    } catch (error) {
        return response.status(500).json({ success: false });
    }
};

// createTeam : rHumanos : Done
/**
 *
 * @param request
 * @param response
 */
exports.createTeam = async (request, response) => {
    try {

        if (response.locals.userPrivilege !== 'direccion' && 
            response.locals.userPrivilege !== 'rHumanos') {
            return response.status(400).json({
                success: false,
                messageTitle: '¡Rempámpanos!',
                messageText: 'Espera un poco y vuelve a intentarlo.'
            });
        }

        const team = await teamsModel.create({});

        // Si no hay usuario, responde con `exists: false`
        if (!team) { return response.status(200).json({ success: true, exists: false }); }

        // Si el email ya existe, responde indicando que existe
        return response.status(200).json({ success: true, exists: true });

    } catch (error) {
        return response.status(500).json({ success: false });
    }
};

// editTeam : rHumanos : Done
/**
 *
 * @param request
 * @param response
 */
exports.editTeam = async (request, response) => {
    try {

        if (response.locals.userPrivilege !== 'direccion' && 
            response.locals.userPrivilege !== 'rHumanos') {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Rempámpanos!',
                messageText: 'Espera un poco y vuelve a intentarlo.'
            });
        }

        const team = await teamsModel.create({});

        // Si no hay usuario, responde con `exists: false`
        if (!team) { return response.status(200).json({ success: true, exists: false }); }

        // Si el email ya existe, responde indicando que existe
        return response.status(200).json({ success: true, exists: true });

    } catch (error) {
        return response.status(500).json({ success: false });
    }
};

// deactivateUser : rHumanos : Done 
/**
 *
 * @param request
 * @param response
 */
exports.deactivateUser = async (request, response) => {
    try {
        const userId = request.body.userId;

        // Input validation
        if (!userId) {
            return response.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'El ID de usuario es requerido.'
            });
        }

        // Validate if it's a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'El formato del ID de usuario es inválido.'
            });
        }

        // Execute findByIdAndUpdate
        const response = await usersModel.findByIdAndUpdate(
            userId,
            { $set: { estaActivo: false } },
            { new: true, runValidators: true }
        );

        // Check if user exists
        if (!response) {
            return res.status(404).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Usuario no encontrado.'
            });
        }

        // Log user out by removing from activeUsers
        //activeUsers.delete(userId);

        return res.status(200).json({ success: true });
    } catch (error) {
        // Handle MongoDB validation errors
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Error de validación en los datos.'
            });
        }

        // Handle MongoDB cast errors (wrong type)
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Tipo de dato incorrecto.'
            });
        }

        console.error('Error deactivating user:', error);

        return res.status(500).json({
            success: false,
            messageTitle: 'Error',
            messageText: 'Tomar captura y favor de informar a soporte técnico. (#210)'
        });
    }
};

// changePassword : rHumanos : Done 
/**
 *
 * @param request
 * @param res
 */
exports.changePassword = async (request, res) => {
    try {
        const password = request.body.password;
        const userId = request.body.userId;

        // Input validation
        if (!userId || !password || typeof userId !== 'string' || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Se necesita el ID de usuario y la contraseña.'
            });
        }

        // Validate if it's a valid MongoDB ObjectId
        const invalidCharsRegex = /[\{\}\:\$\=\'\*\[\]]/;
        if (!mongoose.Types.ObjectId.isValid(userId) || invalidCharsRegex.test(password)) {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'El formato del ID de usuario o de la contraseña es inválido.'
            });
        }

        // Execute password salt and update it
        const hashedPassword = await bcrypt.hash(password, 12);
        const response = await usersModel.findByIdAndUpdate(
            userId,
            { $set: { password: hashedPassword } }, // Change attribute
            { new: true, runValidators: true }
        );

        // If for some reason user not found, send 404
        if (!response) { return res.status(400).json({ success: false, messageTitle: '¡Repámpanos!', messageText: 'Espera un poco y vuelve a intentar.' }); }

        //activeUsers.delete(userId); // log him out 
        return res.status(200).json({ success: true });

    } catch (error) {
        // Handle MongoDB validation errors
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Error de validación en los datos.'
            });
        }

        // Handle MongoDB cast errors (wrong type)
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Tipo de dato incorrecto.'
            });
        }

        console.error('Error deactivating user:', error);

        return res.status(500).json({
            success: false,
            messageTitle: 'Error',
            messageText: 'Tomar captura y favor de informar a soporte técnico. (#225)'
        });
    }
};

// editUser : rHumanos : Done
/**
 *
 * @param request
 * @param res
 */
exports.editUser = async (request, res) => {
    try {
        // 0. VALIDATE USER PRIVILEGES
        if (res.locals.userPrivilege !== 'rHumanos' && res.locals.userPrivilege !== 'direccion') {
            return res.status(403).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'No tienes permisos para realizar esta acción. (#226)'
            });
        }

        // A. GET USER ID AND VALIDATE
        const userId = request.body.userId;

        // Input validation
        if (!userId) {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'El ID de usuario es requerido.'
            });
        }

        // Validate if it's a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'El formato del ID de usuario es inválido.'
            });
        }

        // B. VALIDATE EDITABLE FIELDS
        const {
            nombre, apellidoP, apellidoM, email,
            area, puesto, fechaIngreso, privilegio
        } = request.body;

        // Check if all required fields exist
        if (!nombre || !apellidoP || !apellidoM || !email ||
            !area || !puesto || !fechaIngreso || !privilegio) {
            return res.status(400).json({
                success: false,
                messageTitle: 'Datos Incompletos',
                messageText: 'Todos los campos son requeridos.'
            });
        }

        // C. BUILD UPDATE PAYLOAD
        const updateData = {
            nombre,
            apellidoP,
            apellidoM,
            email,
            area,
            puesto,
            fechaIngreso,
            privilegio
        };

        // Add optional fechaTermino field if provided
        if (request.body.fechaTermino) {
            updateData.fechaBaja = request.body.fechaTermino;
        }

        // Handle optional photo update
        if (request.files?.length > 0) {
            const response = await filesModel.create(request.files[0]);
            if (!response) { throw new Error('Error al guardar el archivo'); }
            updateData.foto = response._id;
        }

        // D. UPDATE USER IN DATABASE
        const response = await usersModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // If user not found, send 404
        if (!response) {
            return res.status(404).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Usuario no encontrado.'
            });
        }

        // Log user out to apply changes
        /*
        if (typeof activeUsers !== 'undefined' && activeUsers.has(userId)) {
            activeUsers.delete(userId);
        }
            */
           
        return res.status(200).json({ success: true });

    } catch (error) {
        console.log(error);
        // Handle MongoDB validation errors
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Error de validación en los datos.'
            });
        }

        // Handle MongoDB cast errors (wrong type)
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({
                success: false,
                messageTitle: '¡Repámpanos!',
                messageText: 'Tipo de dato incorrecto.'
            });
        }

        console.error('Error updating user:', error);

        return res.status(500).json({
            success: false,
            messageTitle: 'Error',
            messageText: 'Tomar captura y favor de informar a soporte técnico. (#227)'
        });
    }
};