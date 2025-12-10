// Backend/src/controllers/inscripciones.controller.js
const pool = require("../db");

// Inscribirse en una actividad (consumidor autenticado) con control de aforo
const crearInscripcion = async (req, res) => {
  const { idactividad, fechainscripcion } = req.body;
  const idconsumidor = req.user.idusuario; // del token

  if (!idactividad) {
    return res.status(400).json({
      mensaje: "Faltan datos obligatorios (idactividad)",
    });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const consResult = await client.query(
      "SELECT 1 FROM consumidor WHERE idusuario = $1",
      [idconsumidor]
    );

    if (consResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ mensaje: "El consumidor no existe" });
    }

    const actResult = await client.query(
      "SELECT * FROM actividad WHERE idactividad = $1 FOR UPDATE",
      [idactividad]
    );

    if (actResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ mensaje: "La actividad no existe" });
    }

    const actividad = actResult.rows[0];
    const plazasValor = Number(actividad.plazas);
    const plazasMax = Number.isFinite(plazasValor) ? plazasValor : null;

    if (
      actividad.disponibilidad === false ||
      (typeof actividad.disponibilidad === "string" &&
        actividad.disponibilidad.toLowerCase() === "cerrada")
    ) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ mensaje: "La actividad no esta disponible para inscripcion" });
    }

    const duplicate = await client.query(
      "SELECT 1 FROM inscripcion WHERE idconsumidor = $1 AND idactividad = $2",
      [idconsumidor, idactividad]
    );
    if (duplicate.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ mensaje: "Ya estas inscrito en esta actividad" });
    }

    const insCount = await client.query(
      "SELECT COUNT(*)::int AS total FROM inscripcion WHERE idactividad = $1",
      [idactividad]
    );
    const totalInscritos = Number(insCount.rows[0]?.total) || 0;

    if (Number.isFinite(plazasMax) && totalInscritos >= plazasMax) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ mensaje: "No quedan plazas disponibles para esta actividad" });
    }

    const result = await client.query(
      `INSERT INTO inscripcion (fechainscripcion, idconsumidor, idactividad)
       VALUES ($1, $2, $3)
       RETURNING idinscripcion`,
      [fechainscripcion || new Date(), idconsumidor, idactividad]
    );

    await client.query("COMMIT");

    res.status(201).json({
      mensaje: "Inscripcion realizada correctamente",
      idinscripcion: result.rows[0].idinscripcion,
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
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ mensaje: "Ya estas inscrito en esta actividad" });
    }
    res.status(500).json({ mensaje: "Error al crear la inscripcion" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Inscripciones de un consumidor (solo el mismo)
const obtenerInscripcionesPorConsumidor = async (req, res) => {
  const { id } = req.params;
  const idParam = parseInt(id, 10);

  if (req.user.tipousuario !== "consumidor" || req.user.idusuario !== idParam) {
    return res.status(403).json({
      mensaje: "Solo el propio consumidor puede ver sus inscripciones",
    });
  }

  try {
    const result = await pool.query(
      `SELECT i.idinscripcion, i.fechainscripcion,
              a.idactividad, a.titulo, a.fecha, a.precio
       FROM inscripcion i
       JOIN actividad a ON i.idactividad = a.idactividad
       WHERE i.idconsumidor = $1`,
      [idParam]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener inscripciones" });
  }
};

// Cancelar inscripcion (solo el consumidor dueno)
const cancelarInscripcion = async (req, res) => {
  const { id } = req.params;
  const idinscripcion = parseInt(id, 10);

  try {
    const insResult = await pool.query(
      "SELECT * FROM inscripcion WHERE idinscripcion = $1",
      [idinscripcion]
    );

    if (insResult.rows.length === 0) {
      return res.status(404).json({ mensaje: "Inscripcion no encontrada" });
    }

    const inscripcion = insResult.rows[0];

    if (inscripcion.idconsumidor !== req.user.idusuario) {
      return res.status(403).json({
        mensaje: "No tienes permiso para cancelar esta inscripcion",
      });
    }

    await pool.query("DELETE FROM inscripcion WHERE idinscripcion = $1", [
      idinscripcion,
    ]);

    res.json({ mensaje: "Inscripcion cancelada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cancelar inscripcion" });
  }
};

module.exports = {
  crearInscripcion,
  obtenerInscripcionesPorConsumidor,
  cancelarInscripcion,
};
