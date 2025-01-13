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
connectDatabase();
/*-------------*/

/* Crafted middlewares (CRITICAL, must be right before routes) */
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

/* Route "/" */
app.get("/", (req, res) => {
  res.redirect("/login");
});
/* Route 404 */
app.use((req, res) => {
  res.status(404).render("404.ejs");  // Catch 404 before middlewares
});
/*-------------*/

/* Client-side temporal token storage */
global.activeUsers = new Set();
// console.log(stringArray.includes("id2")); // Output: true
// stringArray.push("id4");
//global.activeUsers.delete(user._id.toString());

// lets conduct the dual test, two users, one working and then i change the rol
/*-------------*/

/* Start server */
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
/*-------------*/