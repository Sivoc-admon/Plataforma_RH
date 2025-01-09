/* Dependencias */
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
require('dotenv').config();
/*-------------*/


/* Permitir solicitudes tipo JSON */
app.use(express.json());
/*-------------*/

// TODO, implewmetn CRSF token as UUID silently 
//global.asdasdToken = 100;
// access only on backed, like this: console.log(global.asdasdToken);

/* Middleware for parsing request bodies (used for login form or API request body) */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*-------------*/

/* Conexión con base de datos */
const connnectDatabase = require("./utils/database");
connnectDatabase(); // Call the function to connect to the database
/*-------------*/


/* Rutas */
const loginRoutes = require("./routes/login.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const permisosRoutes = require("./routes/permisos.routes");
const vacacionesRoutes = require("./routes/vacaciones.routes");
const cursosRoutes = require("./routes/cursos.routes");
/*------------*/


/* URLs */
app.use("/login", loginRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/permisos", permisosRoutes);
app.use("/vacaciones", vacacionesRoutes);
app.use("/cursos", cursosRoutes);
/*------------*/


/* Archivos estáticos */
app.use(express.static(path.join(__dirname, "public")));
/*-------------*/


/* Configurar la carpeta de vistas */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
/*-------------*/


/* Ruta por defecto "/" previa a la ruta 404*/
app.get("/", (req, res) => {
  res.redirect("/login");
});
/*-------------*/


/* Ruta 404 */
app.use((req, res) => {
  res.status(404).send("404 - Not Found"); // TODO 
});
/*-------------*/


/* Iniciar servidor */
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
/*----

https.createServer(credentials, app).listen(port, () => {
  console.log(`Servidor seguro corriendo en https://localhost:${port}`);
});

---------*/
