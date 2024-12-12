/* Dependencias */
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
/*-------------*/

// TODO refactorizar carpetas de utils en public pq en public van los script.js 

// Middleware for parsing request bodies (used for login form or API request body)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*-------------*/


/* Extacción .env */
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from the .env file
/*-------------*/


/* Conexión con base de datos */
const connnectDatabase = require("./utils/database");
connnectDatabase(); // Call the function to connect to the database
/*-------------*/


/* Rutas */
const loginRoutes = require("./routes/login.routes");
//const usuariosRoutes = require("./routes/usuarios.routes");
//const permisosRoutes = require("./routes/permisos.routes");
//const vacacionesRoutes = require("./routes/vacaciones.routes");
//const cursosRoutes = require("./routes/cursos.routes");
/*------------*/


/* URLs */
app.use("/login", loginRoutes);
//app.use("/usuarios", usuariosRoutes);
//app.use("/permisos", permisosRoutes);
//app.use("/vacaciones", vacacionesRoutes);
//app.use("/cursos", cursosRoutes);
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
  console.log("Invalid URL");
  res.status(404).send("404 - Not Found");
});
/*-------------*/


/* Iniciar servidor */
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
/*-------------*/
