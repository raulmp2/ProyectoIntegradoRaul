// Backend/src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");

// Comprueba que hay token y es valido
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // "Bearer token"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { idusuario, tipousuario, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ mensaje: "Token invalido o expirado" });
  }
};

// Restringe a ofertantes
const requireOfertante = (req, res, next) => {
  if (!req.user || req.user.tipousuario !== "ofertante") {
    return res.status(403).json({ mensaje: "Solo ofertantes autorizados" });
  }
  next();
};

// Restringe a consumidores
const requireConsumidor = (req, res, next) => {
  if (!req.user || req.user.tipousuario !== "consumidor") {
    return res.status(403).json({ mensaje: "Solo consumidores autorizados" });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireOfertante,
  requireConsumidor,
};
