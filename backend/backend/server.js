require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./src/config/database");
const modelos = require("./src/models");
const routes = require("./src/routes");
const { manejadorErrores, rutaNoEncontrada } = require("./src/middlewares/errorHandler");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y utilidad
// Helmet bloquea por defecto que OTRO origen cargue tus archivos (Cross-Origin-Resource-Policy: same-origin).
// Como el frontend y el backend viven en dominios distintos, hay que permitirlo o las fotos/firmas no se ven.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos subidos (fotos, escudos, firmas, carnets) — reemplazo del FTP externo del sistema viejo
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Límite de intentos de login para mitigar fuerza bruta
const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: "Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos." }
});
app.use("/api/auth/login", limitadorLogin);

// Límite para recuperación de contraseña (cuenta todas las peticiones, no solo las fallidas)
const limitadorRecuperacion = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: "Demasiadas solicitudes de recuperación. Intenta de nuevo en unos minutos." }
});
app.use(
  ["/api/auth/recuperar-password", "/api/auth/restablecer-password", "/api/auth/solicitar-restablecimiento"],
  limitadorRecuperacion
);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    mensaje: "Bienvenido a la API de EasyNotes",
    estado: "Servidor funcionando correctamente"
  });
});

app.use("/api", routes);

// 404 y manejo centralizado de errores (siempre al final)
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

const startServer = async () => {
  try {
    await connectDB();

    console.log("\nModelos registrados:");
    Object.keys(modelos).forEach(nombreModelo => console.log(`   - ${nombreModelo}`));

    app.listen(PORT, () => {
      console.log(`\n[OK] API ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    process.exit(1);
  }
};

startServer();