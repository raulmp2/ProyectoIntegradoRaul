// Backend/src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const usuariosRoutes = require("./routes/usuarios.routes");
const actividadesRoutes = require("./routes/actividades.routes");
const inscripcionesRoutes = require("./routes/inscripcion.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});

// Rutas
app.use("/auth", authRoutes); // /auth/login
app.use("/usuarios", usuariosRoutes); // /usuarios
app.use("/actividades", actividadesRoutes); // /actividades...
app.use("/inscripciones", inscripcionesRoutes); // /inscripciones...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
