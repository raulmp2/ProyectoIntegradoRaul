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

// Actualizar nombre del usuario autenticado
const actualizarNombre = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  const idParam = parseInt(id, 10);

  if (Number.isNaN(idParam)) {
    return res.status(400).json({ mensaje: "El id de usuario no es valido" });
  }

  if (!req.user || req.user.idusuario !== idParam) {
    return res
      .status(403)
      .json({ mensaje: "Solo puedes gestionar tu propia cuenta" });
  }

  const nuevoNombre = (nombre || "").trim();
  if (!nuevoNombre) {
    return res.status(400).json({ mensaje: "El nombre es obligatorio" });
  }

  try {
    const result = await pool.query(
      `UPDATE usuario
       SET nombre = $1
       WHERE idusuario = $2
       RETURNING idusuario, nombre, email, tipousuario`,
      [nuevoNombre, idParam]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({
      mensaje: "Nombre actualizado correctamente",
      usuario: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar el nombre" });
  }
};

// Borrar usuario y datos relacionados (cascada)
const borrarUsuario = async (req, res) => {
  const { id } = req.params;
  const idParam = parseInt(id, 10);

  if (Number.isNaN(idParam)) {
    return res.status(400).json({ mensaje: "El id de usuario no es valido" });
  }

  if (!req.user || req.user.idusuario !== idParam) {
    return res
      .status(403)
      .json({ mensaje: "Solo puedes borrar tu propia cuenta" });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT idusuario FROM usuario WHERE idusuario = $1",
      [idParam]
    );
    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    await client.query("DELETE FROM usuario WHERE idusuario = $1", [idParam]);
    await client.query("COMMIT");

    res.json({
      mensaje:
        "Cuenta eliminada correctamente. Los datos asociados se borraron en cascada.",
    });
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("Error al hacer rollback", rollbackErr);
      }
    }
    console.error(err);
    res.status(500).json({ mensaje: "Error al eliminar la cuenta" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  crearUsuario,
  actualizarNombre,
  borrarUsuario,
};
