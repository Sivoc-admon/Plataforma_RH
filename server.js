/* Dependencies  */
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { authorize } = require('./utils/jwt');
require('dotenv').config();
/*-------------*/

/* Goblar middlewares */
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
/*-------------*/

/* Static files */
app.use(express.static(path.join(__dirname, "public")));
/*-------------*/

/* Ejs view engine */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
/*-------------*/

/* Database connection */
const connectDatabase = require("./utils/database");
connectDatabase(); // Call the function to connect to the database
/*-------------*/

/* Crafted middlewares */
app.use(authorize);
/*-------------*/

/* Routes */
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

/* Ruta por defecto "/" previa a la ruta 404*/
app.get("/", (req, res) => {
  res.redirect("/login");
});
app.use((req, res) => {
  res.status(404).send("404 - Not Found");
});
/*-------------*/

/* Start server */
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
/*-------------*/