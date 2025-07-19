/* Dependencies (Node.js v20.13.1) */
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
require('dotenv').config();
const mongoose = require('mongoose'); global.mongoose = mongoose;
const fs = require('fs');

const { authorize } = require('./utils/jwt');
const { sanitizeInputs } = require('./utils/sanitizeInputs');
/*-------------*/

/* Global middlewares */
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
(async () => await mongoose.connect(process.env.URI)
  .then(() => console.log('✅ Conexión exitosa a la base de datos.'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err)))();
/*-------------*/

/* (Critical) (Before Routes) Decode JWT on every fetch to authorize any intent */
app.use(authorize);
app.use(sanitizeInputs); /* Then, remove all possible mongoDB noSQL attacks */
/*-------------*/

/* URLs */
app.use("/login", require("./routes/login.routes"));   
app.use("/usuarios", require("./routes/usuarios.routes"));
app.use("/permisos", require("./routes/permisos.routes"));
app.use("/vacaciones", require("./routes/vacaciones.routes"));
app.use("/cursos", require("./routes/cursos.routes"));
/*------------*/

/* Global routes */
app.get("/", (req, res) => {
  res.redirect("/login");
});
app.get("/logout", (req, res) => {
  res.clearCookie('__psmxoflxpspgolxps_mid');
  res.redirect("/login");
});
app.get("/Unauthorized", (req, res) => {
  res.clearCookie('__psmxoflxpspgolxps_mid');
  res.status(404).render("404.ejs");  // Catch 404 before middlewares
});
// 🔹 Ruta para servir imágenes sin hacerlas públicas
app.get('/getPfp', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'usuarios', res.locals.userPhoto);

  // Verificar si el archivo existe antes de enviarlo
  if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
  } else {
      return res.status(404).send('Archivo no encontrado');
  }
});
/*-------------*/

/* Client-side active sessions tracker */
global.activeUsers = new Set();
/*-------------*/

/* Start server */
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
/*-------------*/