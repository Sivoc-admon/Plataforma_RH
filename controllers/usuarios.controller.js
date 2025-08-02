const IAM = require('../utils/IAM.json');
const { fetchPostgREST } = require('../utils/scripts/postgrestHelper');

/**
 * Constantes para la configuración del módulo de usuarios.
 */
const ERROR_MESSAGE = process.env.ERROR_MESSAGE;
const NODE_ENV = process.env.NODE_ENV;
const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Controla el acceso y la carga de la vista del tablero de los usuarios
 * Tambien tiene acceso a edición directamente sobre la tabla, activación y desactivacion shinshon
 * @async req res next
 * @returns {Promise<Object>}
 */
async function verTableroActivados(req, res) {
    // Consulta los permisos de la petición
    const userRole = res.locals.privilegio;
    if (!userRole || !IAM[userRole]?.usuario.verTableroActivados) {
        return res.status(401).send("No tienes permisos para acceder a este recurso.");
    }

    // Ejecuta el fetch de la información de los usuarios
    const pgRestRequest = {
        fetchMethod: 'GET',
        fetchUrl: `${BACKEND_URL}/usuario?select=id,id_equipo,email,privilegio,habilitado`, // TO DO (multi-query)
        fetchBody: {}
    }

    // Captura el error al consultar la base de datos
    const response = await fetchPostgREST(pgRestRequest);
    if (!response.ok) {
        return res.status(500).send(process.env.ERROR_MESSAGE + '007');
    }

    const dataUsuarios = await response.json();
    console.log("dataUsuarios; from postgREST usuarios: ", dataUsuarios);

    // Despliega la vista // TO DO full modulo-usuarios dummy data script
    // la base de datos de sivoc_scripting será wipeOut wipeIn con puros scripts
    /* 
                id: '1',
                nombre: 'Juan',
                apellidoP: 'Pérez',
                apellidoM: 'González',
                email: 'juan.perez@company.com',
                fechaIngreso: '2023-01-15',
                area: 'Administración',
                puesto: 'Director General',
                privilegio: 'direccion'

    */
    return res.render('../views/usuarios/tableroUsuariosActivados.ejs', { dataUsuarios });
};

module.exports = { verTableroActivados };