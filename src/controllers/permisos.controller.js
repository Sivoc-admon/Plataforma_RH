const IAM = require('../utils/IAM.json');
const { fetchPostgREST } = require('../utils/scripts/postgrestHelper');

/**
 * Constantes para la configuración del módulo de usuarios.
 */
const ERROR_MESSAGE = process.env.ERROR_MESSAGE;
const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Controla el acceso y la carga de la vista del tablero de permisos
 * Todos los usuarios tienen acceso a este tablero, solo que con diferencias de los datos
 * @async req res next
 * @returns {Promise<Object>}
 */
async function verTableroPermisos(req, res) {

    // Consulta y valida los permisos de la petición
    const userRole = res.locals.privilegio;
    const privilegiosActuales = IAM.verTableroPermisos?.[userRole];
    if (!privilegiosActuales) {
        return res.status(401).send("No tienes permisos para acceder a este recurso.");
    }

    // TO WORK
    // load in sequence: cargarTodosLosPermisos, cargarPermisosEquipo, cargarTusPermisos
    res.locals.cargarTodosLosPermisos = privilegiosActuales.cargarTodosLosPermisos;
    res.locals.cargarPermisosEquipo = privilegiosActuales.cargarPermisosEquipo;
    res.locals.cargarTusPermisos = privilegiosActuales.cargarTusPermisos;
    // just use a simple if cargarTodosLosPermisos === true, load table,
    // and stack em up

    // Ejecuta un fetch con su dataJson por cada tablesToLoad, que quede todo automático

    // Ejecuta el fetch de la información de los usuarios
    const pgRestRequest = {
        fetchMethod: 'GET',
        fetchUrl: `${BACKEND_URL}/permiso?select=*,gestion_permiso(id_permiso,id_equipo,descripcion,estado,solicitado,revisado),usuario(dato_personal(nombre,apellido_p,apellido_m))`,
        fetchBody: {}
    }

    // Captura el error al consultar la base de datos
    const response = await fetchPostgREST(pgRestRequest);
    if (!response.ok) {
        return res.status(500).send(ERROR_MESSAGE + '007');
    }

    const data = await response.json();

    // Transformar datos
    const dataJson = data.map(u => ({
        //id: String(u.id),
        solicitante_fullName:
            `${u.usuario?.dato_personal?.nombre || "Sin nombre"} ` +
            `${u.usuario?.dato_personal?.apellido_p || "Sin apellido"} ` +
            `${u.usuario?.dato_personal?.apellido_m || "Sin apellido"}`,
        tipo: u.tipo,
        descripcion: `${u.gestion_permiso?.descripcion || "-"} `,
        fecha_inicio: u.fecha_inicio,
        fecha_termino: u.fecha_termino,
        solicitado: u.gestion_permiso?.solicitado,
        revisado: u.gestion_permiso?.revisado,
        estado: `${u.gestion_permiso?.estado}`,
    }));

    return res.render('../views/permisos/tableroPermisos.ejs', { dataJson });
};

module.exports = { verTableroPermisos };