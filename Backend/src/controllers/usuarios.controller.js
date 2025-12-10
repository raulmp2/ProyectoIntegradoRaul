// Backend/src/controllers/usuarios.controller.js
const pool = require("../db");
const bcrypt = require("bcrypt");

// Registrar usuario (ofertante o consumidor)
const crearUsuario = async (req, res) => {
  const { nombre, email, contrasena, tipousuario } = req.body;

  if (!nombre || !email || !contrasena || !tipousuario) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  if (tipousuario !== "ofertante" && tipousuario !== "consumidor") {
    return res
      .status(400)
      .json({ mensaje: "tipousuario debe ser 'ofertante' o 'consumidor'" });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(contrasena, saltRounds);

    const userResult = await pool.query(
      `INSERT INTO usuario (nombre, email, contrasena, tipousuario)
       VALUES ($1, $2, $3, $4)
       RETURNING idusuario, tipousuario`,
      [nombre, email, passwordHash, tipousuario]
    );

    const { idusuario } = userResult.rows[0];

    if (tipousuario === "ofertante") {
      await pool.query("INSERT INTO ofertante (idusuario) VALUES ($1)", [
        idusuario,
      ]);
    } else {
      await pool.query("INSERT INTO consumidor (idusuario) VALUES ($1)", [
        idusuario,
      ]);
    }

    res
      .status(201)
      .json({ mensaje: "Usuario registrado correctamente", idusuario });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      // email duplicado
      return res.status(400).json({ mensaje: "El email ya esta registrado" });
    }
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
};

module.exports = {
  crearUsuario,
};
