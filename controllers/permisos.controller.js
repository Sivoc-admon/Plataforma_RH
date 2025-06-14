const mongoose = require('mongoose');
const filesModel = require('../models/files.model');
const permitsModel = require('../models/permisos.model');
const teamsSchema = require('../models/equipos.model');
const path = require('path');
const fs = require('fs');

// Constantes para códigos de error
const ERROR_CODES = {
    INVALID_PARAMS: '008',
    INVALID_OBJECT_ID: '009',
    FILE_NOT_FOUND: '404',
    INVALID_FIELDS: '001',
    INVALID_DATA: '002',
    INVALID_DATES: '003',
    DATE_LOGIC_ERROR: '004',
    INCAPACITY_TIME_ERROR: '005',
    VALIDATION_ERROR: '006',
    GENERAL_ERROR: '007'
};

const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
};

const PERMIT_STATUS = {
    PENDING: 'Pendiente'
};

const MAX_INDENTATION_LEVELS = 2;
const DATE_VALIDATION_HOUR = 0;

/**
 * Envía una respuesta de error estandarizada
 * @param response
 * @param statusCode
 * @param messageTitle
 * @param messageText
 */
const sendErrorResponse = (response, statusCode, messageTitle, messageText) => {
    return response.status(statusCode).json({
        success: false,
        messageTitle,
        messageText
    });
};

/**
 * Envía una respuesta de éxito estandarizada
 * @param response
 * @param data
 */
const sendSuccessResponse = (response, data = null) => {
    const responseDefault = { success: true };
    if (data) {response.message = data;}
    return response.status(HTTP_STATUS.OK).json(responseDefault);
};

/**
 * Valida si un ObjectId de MongoDB es válido
 * @param id
 */
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Valida que los campos recibidos estén dentro de los permitidos
 * @param receivedFields
 * @param allowedFields
 */
const validateAllowedFields = (receivedFields, allowedFields) => {
    return !receivedFields.some(field => !allowedFields.includes(field));
};

/**
 * Valida que las fechas sean válidas y cumplan la lógica de negocio
 * @param fechaInicio
 * @param fechaTermino
 * @param registro
 */
const validateDates = (fechaInicio, fechaTermino, registro) => {
    const fechaInicioDate = new Date(fechaInicio);
    const fechaTerminoDate = new Date(fechaTermino);
    const today = new Date();

    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaTerminoDate.getTime())) {
        return { isValid: false, errorCode: ERROR_CODES.INVALID_DATES };
    }

    const fechaInicioTime = fechaInicioDate.getTime();
    const fechaTerminoTime = fechaTerminoDate.getTime();

    if (fechaInicioTime >= fechaTerminoTime || today > fechaInicioTime || today > fechaTerminoTime) {
        return { isValid: false, errorCode: ERROR_CODES.DATE_LOGIC_ERROR };
    }

    if (registro === 'Incapacidad' && fechaInicioDate.getHours() !== DATE_VALIDATION_HOUR) {
        return { isValid: false, errorCode: ERROR_CODES.INCAPACITY_TIME_ERROR };
    }

    return { isValid: true };
};

/**
 * Procesa archivos subidos y los guarda en la base de datos
 * @param files
 */
const processUploadedFiles = async (files) => {
    if (!files || files.length === 0) {return [];}

    const documentResponses = await Promise.all(
        files.map(async (file) => {
            return await filesModel.create(file);
        })
    );

    return documentResponses.map(document_ => document_._id);
};

/**
 * Elimina archivos del sistema de archivos y base de datos
 * @param docPaths
 * @param documentPaths
 */
const deleteFiles = async (documentPaths) => {
    for (const item of documentPaths) {
        const filePath = path.join(__dirname, '..', 'uploads', 'permisos', item.filename);
        
        try {
            await fs.promises.unlink(filePath);
            await filesModel.deleteOne({ _id: item._id });
        } catch (error) {
            throw new Error('Error eliminando archivos');
        }
    }
};

/**
 * Formatea una fecha ISO a formato legible en español
 * @param isoDate
 */
const formatReadableDateTime = (isoDate) => {
    const date = new Date(isoDate);
    const readableDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const readableTime = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${readableDate}, ${readableTime}`;
};

/**
 * Obtiene un archivo de permiso para visualización
 * @param request
 * @param response
 */
exports.viewPermitsRowFile = async (request, response) => {
    try {
        const { permitId, filename } = request.params;
        
        if (!permitId || !filename || typeof permitId !== 'string' || typeof filename !== 'string') {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                `Espera un poco y vuelve a intentar. (#${ERROR_CODES.INVALID_PARAMS})`);
        }

        if (!isValidObjectId(permitId)) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                `Espera un poco y vuelve a intentar. (#${ERROR_CODES.INVALID_OBJECT_ID})`);
        }

        const permit = await permitsModel.findOne({ _id: permitId })
            .populate('docPaths', 'originalname filename')
            .select('-__v');

        if (!permit) {
            return sendErrorResponse(response, HTTP_STATUS.NOT_FOUND, 'Error', 'Permiso no encontrado');
        }

        const matchingDocument = permit.docPaths.find(item => item.originalname === filename);

        if (matchingDocument) {
            const filePath = path.join(__dirname, '..', 'uploads', 'permisos', matchingDocument.filename);
            response.sendFile(filePath, (error) => {
                if (error) {
                    response.status(HTTP_STATUS.NOT_FOUND).send('No se encontró el archivo PDF.');
                }
            });
        } else {
            return sendErrorResponse(response, HTTP_STATUS.NOT_FOUND, 'Error', 'Archivo no encontrado');
        }

    } catch (error) {
        response.status(HTTP_STATUS.INTERNAL_ERROR).send(
            `Tomar captura y favor de informar a soporte técnico. (#${ERROR_CODES.INVALID_PARAMS})`);
    }
};

/**
 * Crea una nueva solicitud de permiso
 * @param request
 * @param response
 */
exports.createPermitRequest = async (request, response) => {
    try {
        const allowedFields = ['registro', 'filtro', 'fechaInicio', 'fechaTermino'];
        const receivedFields = Object.keys(request.body);

        if (!validateAllowedFields(receivedFields, allowedFields)) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                `Espera un poco y vuelve a intentar. (#${ERROR_CODES.INVALID_FIELDS})`);
        }

        const { registro, filtro, fechaInicio, fechaTermino } = request.body;

        if (!registro || !filtro || !fechaInicio || !fechaTermino ||
            typeof registro !== 'string' || typeof filtro !== 'string' ||
            typeof fechaInicio !== 'string' || typeof fechaTermino !== 'string') {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                `Espera un poco y vuelve a intentar. (#${ERROR_CODES.INVALID_DATA})`);
        }

        const dateValidation = validateDates(fechaInicio, fechaTermino, registro);
        if (!dateValidation.isValid) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                `Espera un poco y vuelve a intentar. (#${dateValidation.errorCode})`);
        }

        const documentPaths = await processUploadedFiles(request.files);

        const payload = {
            userId: response.locals.userId,
            registro: request.body.registro,
            filtro: request.body.filtro,
            fechaInicio: fechaInicio,
            fechaTermino: fechaTermino,
            docPaths: documentPaths,
            estatus: PERMIT_STATUS.PENDING,
            isSent: false,
            isVerified: false,
        };

        await permitsModel.create(payload);
        return sendSuccessResponse(response);

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                `Espera un poco y vuelve a intentar. (#${ERROR_CODES.VALIDATION_ERROR})`);
        }
        return sendErrorResponse(res, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
            `Tomar captura y favor de informar a soporte técnico. (#${ERROR_CODES.GENERAL_ERROR})`);
    }
};

/**
 * Elimina un permiso y sus archivos asociados
 * @param request
 * @param response
 */
exports.deletePermit = async (request, response) => {
    try {
        const { permitId } = request.body;

        if (!permitId || typeof permitId !== 'string') {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#018)');
        }

        const permit = await permitsModel.findOne({ 
            _id: permitId, 
            isSent: false, 
            isVerified: false 
        }).populate('docPaths', 'filename');

        if (!permit) {
            return sendErrorResponse(response, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
                'Tomar captura y favor de informar a soporte técnico. (#022)');
        }

        await deleteFiles(permit.docPaths);

        const deletionResponse = await permitsModel.deleteOne({ _id: permitId });
        if (!deletionResponse) {
            return sendErrorResponse(response, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
                'Tomar captura y favor de informar a soporte técnico. (#024)');
        }

        return sendSuccessResponse(response);

    } catch (error) {
        return sendErrorResponse(response, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
            'Tomar captura y favor de informar a soporte técnico. (#025)');
    }
};

/**
 * Marca un permiso como enviado
 * @param request
 * @param response
 */
exports.sendPermit = async (request, response) => {
    try {
        const { permitId } = request.body;

        if (!permitId || typeof permitId !== 'string') {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#026)');
        }

        const permit = await permitsModel.findOne({ 
            _id: permitId, 
            isSent: false, 
            isVerified: false 
        });

        if (!permit) {
            return sendErrorResponse(response, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
                'Tomar captura y favor de informar a soporte técnico. (#027)');
        }

        const updateResponse = await permitsModel.findByIdAndUpdate(
            permitId, 
            { $set: { isSent: true } }, 
            { new: true, runValidators: true }
        );

        if (!updateResponse) {
            return sendErrorResponse(response, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
                'Tomar captura y favor de informar a soporte técnico. (#028)');
        }

        return sendSuccessResponse(response);

    } catch (error) {
        return sendErrorResponse(response, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
            'Tomar captura y favor de informar a soporte técnico. (#029)');
    }
};

/**
 * Obtiene información de un permiso para edición
 * @param request
 * @param response
 */
exports.editPermit_getInfo = async (request, response) => {
    try {
        const { permitId } = request.body;

        if (!permitId || typeof permitId !== 'string') {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#011)');
        }

        const permit = await permitsModel.findOne({
            _id: permitId,
            isSent: false,
            isVerified: false
        }).populate('docPaths', 'originalname').select('-__v');

        if (!permit) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#013)');
        }

        return sendSuccessResponse(response, permit);

    } catch (error) {
        return sendErrorResponse(response, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
            'Tomar captura y favor de informar a soporte técnico. (#012)');
    }
};

/**
 * Procesa archivos para edición de permiso
 * @param permitData
 * @param archivosSeleccionados
 * @param requestFiles
 */
const processEditFiles = async (permitData, archivosSeleccionados, requestFiles) => {
    let paths = [];
    const dataArray = permitData.docPaths;
    const parsedFilesArray = JSON.parse(archivosSeleccionados);

    for (const item of dataArray) {
        const isBeingReplaced = requestFiles.some(file => file.originalname === item.originalname);
        const isSelected = parsedFilesArray.some(file => file.name === item.originalname);

        if (isBeingReplaced || !isSelected) {
            const filePath = path.join(__dirname, '..', 'uploads', 'permisos', item.filename);
            try {
                await fs.promises.unlink(filePath);
                await filesModel.deleteOne({ _id: item._id });
            } catch (error) {
                throw new Error('Error procesando archivos');
            }
        } else {
            paths.push(item);
        }
    }

    if (requestFiles && requestFiles.length > 0) {
        const documentResponses = await Promise.all(
            requestFiles.map(file => filesModel.create(file))
        );
        paths = [...paths, ...documentResponses];
    }

    return paths;
};

/**
 * Actualiza información de un permiso existente
 * @param request
 * @param response
 */
exports.editPermit_postInfo = async (request, response) => {
    try {
        const allowedFields = ['permitId', 'filtro', 'fechaInicio', 'fechaTermino', 'archivosSeleccionados', 'files'];
        const receivedFields = Object.keys(request.body);

        if (!validateAllowedFields(receivedFields, allowedFields)) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#035)');
        }

        const { permitId, filtro, fechaInicio, fechaTermino, archivosSeleccionados } = request.body;

        if ([permitId, filtro, fechaInicio, fechaTermino, archivosSeleccionados].some(
            field => typeof field !== 'string') || !permitId) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#036)');
        }

        const permitData = await permitsModel.findOne({
            _id: permitId,
            isSent: false,
            isVerified: false
        }).populate('docPaths', '_id filename originalname').select('-__v');

        if (!permitData) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar.(#034)');
        }

        if (permitData.userId != response.locals.userId) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar.(#45)');
        }

        const paths = await processEditFiles(permitData, archivosSeleccionados, request.files);

        const payload = {
            ...(filtro && { filtro }),
            ...(fechaInicio && { fechaInicio: fechaInicio }),
            ...(fechaTermino && { fechaTermino: fechaTermino }),
            ...(paths.length > 0 && { docPaths: paths })
        };

        await permitsModel.findByIdAndUpdate(
            permitId,
            { $set: payload },
            { new: true, runValidators: true }
        );

        return sendSuccessResponse(response);

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#006)');
        }
        return sendErrorResponse(res, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
            'Tomar captura y favor de informar a soporte técnico. (#040)');
    }
};

/**
 * Cambia el estatus de un permiso
 * @param request
 * @param response
 */
exports.changeStatus = async (request, response) => {
    try {
        const { permitId, estatus } = request.body;

        if (!permitId || typeof permitId !== 'string' || !estatus || typeof estatus !== 'string') {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#035)');
        }

        const permitData = await permitsModel.findOne({ _id: permitId });

        if (!permitData) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#058)');
        }

        if (!permitData.isSent || permitData.isVerified) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#055)');
        }

        const updatedPermit = await permitsModel.findByIdAndUpdate(
            permitId,
            { $set: { estatus: estatus } },
            { new: true, runValidators: true }
        );

        if (!updatedPermit) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#059)');
        }

        return sendSuccessResponse(response);

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#057)');
        }
        return sendErrorResponse(response, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
            'Tomar captura y favor de informar a soporte técnico. (#060)');
    }
};

/**
 * Verifica un permiso marcándolo como verificado
 * @param request
 * @param response
 */
exports.verifyPermit = async (request, response) => {
    try {
        const { permitId } = request.body;

        if (!permitId || typeof permitId !== 'string') {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#068)');
        }

        const permitData = await permitsModel.findOne({ _id: permitId });

        if (!permitData) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#067)');
        }

        if (!permitData.isSent || permitData.isVerified) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#066)');
        }

        const updatedPermit = await permitsModel.findByIdAndUpdate(
            permitId,
            { $set: { isVerified: true } },
            { new: true, runValidators: true }
        );

        if (!updatedPermit) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#065)');
        }

        return sendSuccessResponse(response);

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return sendErrorResponse(response, HTTP_STATUS.BAD_REQUEST, '¡Repámpanos!', 
                'Espera un poco y vuelve a intentar. (#069)');
        }
        return sendErrorResponse(response, HTTP_STATUS.INTERNAL_ERROR, 'Error', 
            'Tomar captura y favor de informar a soporte técnico. (#070)');
    }
};

/**
 * Obtiene permisos para colaboradores
 * @param userId
 */
const getCollaboratorPermits = async (userId) => {
    const permits = await permitsModel.find({ userId: userId })
        .populate('docPaths', '_id originalname filename')
        .select('-__v');

    return permits.map(permit => ({
        ...permit.toObject(),
        fechaInicio: formatReadableDateTime(permit.fechaInicio),
        fechaTermino: formatReadableDateTime(permit.fechaTermino)
    }));
};

/**
 * Obtiene permisos para jefe inmediato
 * @param userId
 */
const getManagerPermits = async (userId) => {
    const team = await teamsSchema.find({ jefeInmediatoIds: { $in: [userId] } }).select('-__v');
    let permits = [];

    if (team.length > 0) {
        const teamData = team[0];
        const permitPromises = teamData.colaboradoresIds.map(userId => {
            return permitsModel.find({ userId: userId, isSent: true })
                .populate('userId', 'nombre apellidoP apellidoM area')
                .populate('docPaths', '_id originalname filename path')
                .select('-__v');
        });

        const permitsResults = await Promise.all(permitPromises);
        permits = permitsResults.flat();
    }

    return permits.map(permit => ({
        ...permit.toObject(),
        fechaInicio: formatReadableDateTime(permit.fechaInicio),
        fechaTermino: formatReadableDateTime(permit.fechaTermino)
    }));
};

/**
 * Obtiene permisos para recursos humanos
 */
const getHRPermits = async () => {
    const permits = await permitsModel.find({ isSent: true })
        .populate('userId', 'nombre apellidoP apellidoM area')
        .populate('docPaths', '_id originalname filename path')
        .select('-__v');

    return permits.map(permit => ({
        ...permit.toObject(),
        fechaInicio: formatReadableDateTime(permit.fechaInicio),
        fechaTermino: formatReadableDateTime(permit.fechaTermino)
    }));
};

/**
 * Accede al módulo de permisos según el tipo de usuario
 * @param request
 * @param response
 */
exports.accessPermitsModule = async (request, response) => {
    try {
        let permitsRows = '';
        const userPrivilege = response.locals.userPrivilege;
        const userId = response.locals.userId;

        if (userPrivilege === 'colaborador') {
            permitsRows = await getCollaboratorPermits(userId);
            return response.render('permisos/colaboradorPermitsView.ejs', { permitsRows });
        }

        if (userPrivilege === 'jefeInmediato') {
            permitsRows = await getManagerPermits(userId);
            return response.render('permisos/jefeInmediatoPermitsView.ejs', { permitsRows });
        }

        if (userPrivilege === 'rHumanos' || userPrivilege === 'direccion') {
            permitsRows = await getHRPermits();
            return response.render('permisos/rHumanosPermitsView.ejs', { permitsRows });
        }

        return response.redirect('/login');

    } catch (error) {
        response.status(HTTP_STATUS.INTERNAL_ERROR).send('Tomar captura y favor de informar a soporte técnico. (#070)');
    }
};