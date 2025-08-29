/* --- Import routes.js logic --- */
const express = require('express');
const router = express.Router();
const NGINX_TAG = process.env.NGINX_TAG;
const URL_TAG = process.env.URL_TAG;
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// TO WORK (critical), how does IAM authorization will work here?

const { fetchPostgREST } = require('../utils/scripts/postgrestHelper');

// La configuración del storage de multer está indicada por la petición que se ejecuta
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads", req.entidad_nombre);

        // Crea el directorio si no existe
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // agrega extensión del archivo
    }
});
const upload = multer({ storage });

// Ruta: Postear un archivo a través de filepond manager hacia el entidad indicada en req.entidad_nombre
router.use(
    `${URL_TAG}/postFile`,
    generalLimiter,
    (req, res, next) => {
        req.entidad_nombre = "permiso"; // ahora lo asignas a req
        res.locals.isDownload = false;
        next();
    },
    upload.single("file"), // el archivo ya está subido aquí
    getFile
);

module.exports = router;

// listar archivos - formato simplificado para FilePond
app.get("/api/files", (req, res) => {
  const db = loadDB();
  // Simplificar el formato - FilePond solo necesita el ID para cargar
  const fileList = db.map(file => ({
    id: file.id,
    originalName: file.originalName,
    size: file.size
  }));
  res.json(fileList);
});

// eliminar archivo
app.delete("/api/upload/:id", (req, res) => {
  const db = loadDB();
  const fileId = req.params.id;
  const fileIndex = db.findIndex(f => f.id === fileId);

  if (fileIndex === -1) {
    return res.status(404).json({ error: "File not found" });
  }

  const filePath = path.join(uploadsDir, db[fileIndex].id);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }

  db.splice(fileIndex, 1);
  saveDB(db);

  res.json({ deleted: fileId });
});

// endpoint para servir archivos con headers apropiados
app.get("/uploads/:id", (req, res) => {
  const db = loadDB();
  const fileId = req.params.id;
  const fileInfo = db.find(f => f.id === fileId);
  
  const filePath = path.join(uploadsDir, fileId);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // Establecer headers apropiados si tenemos info del archivo
  if (fileInfo) {
    res.set({
      'Content-Type': fileInfo.mimetype || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${fileInfo.originalName}"`
    });
  }
  
  res.sendFile(filePath);
});

// endpoint para ver archivo directamente (preview/download)
app.get("/api/view/:id", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.id);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.status(404).send("File not found");
});



// subir archivo
const postFile = async (req, res, next) => {
    const entidad_nombre = res.locals.entidad_nombre || '';
    const nombre_original = res.locals.nombre_original || '';
    const nombre_almacenado = res.locals.nombre_almacenado || '';
    const filePath = path.join(__dirname, '..', '..', 'uploads', entidad_nombre, nombre_almacenado);

    // 1. Get the metadata from the form with file
    const fileMeta = {
        id: req.file.filename,        // nombre en disco
        originalName: req.file.originalname,
        //size: req.file.size,
        //mimetype: req.file.mimetype,
        //path: `/uploads/${req.file.filename}`,
        //uploadDate: new Date().toISOString()
    };
    // TO WORK

    // Ejecuta el fetch de la información del usuario
    const pgRestRequest = {
        fetchMethod: 'POST',
        fetchUrl: `${BACKEND_URL}/usuario?select=id,dato_personal(nombre,apellido_p,apellido_m),privilegio,password,habilitado,pfp_almacenado,email&email=eq.${email}`,
        fetchBody: {}
    }

    // Captura el error al consultar la base de datos
    const response = await fetchPostgREST(pgRestRequest);
    if (!response.ok) {
        return {
            success: false,
            message: process.env.ERROR_MESSAGE + '006'
        };
    }



    // Configuración Multer con diskStorage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
            cb(null, uniqueName);
        }
    });

    const entidad_nombre = res.locals.entidad_nombre || '';
    const nombre_original = res.locals.nombre_original || '';
    const nombre_almacenado = res.locals.nombre_almacenado || '';
    const isDownload = res.locals.isDownload || '';
    const filePath = path.join(__dirname, '..', '..', 'uploads', entidad_nombre, nombre_almacenado);
    if (fs.existsSync(filePath)) {
        if (isDownload) {
            return res.download(filePath, nombre_original);
        }
        return res.sendFile(filePath);
    } else {
        return res.status(404).send('Archivo no encontrado');
    }
};
app.post("/api/upload", , (req, res) => {


    db.push(fileMeta);
    saveDB(db);

    res.json(fileMeta);
});
