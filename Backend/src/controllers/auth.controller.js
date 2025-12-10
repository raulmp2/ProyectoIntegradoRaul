// Backend/src/controllers/auth.controller.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login
const login = async (req, res) => {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res
      .status(400)
      .json({ mensaje: "Email y contrasena son obligatorios" });
  }

  try {
    const result = await pool.query(
      `SELECT idusuario, nombre, email, contrasena, tipousuario
       FROM usuario
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ mensaje: "Credenciales incorrectas" });
    }

    const usuario = result.rows[0];

    const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordMatch) {
      return res.status(400).json({ mensaje: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        idusuario: usuario.idusuario,
        tipousuario: usuario.tipousuario,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      mensaje: "Login correcto",
      token,
      usuario: {
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
        email: usuario.email,
        tipousuario: usuario.tipousuario,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error en el login" });
  }
};

module.exports = {
  login,
};
