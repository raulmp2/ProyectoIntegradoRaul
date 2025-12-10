// Backend/src/controllers/actividades.controller.js
const pool = require("../db");

// Obtener todas las actividades (publico)
const obtenerActividades = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*,
              u.nombre AS ofertante_nombre,
              u.email AS ofertante_email
       FROM actividad a
       JOIN usuario u ON u.idusuario = a.idofertante`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al consultar actividades");
  }
};

// Crear actividad (ofertante autenticado)
const crearActividad = async (req, res) => {
  const {
    titulo,
    descripcion,
    tipo,
    fecha,
    disponibilidad,
    precio,
    plazas,
  } = req.body;
  const { horainicio, horafin } = req.body;

  const normalizeTime = (val) => (val === "" || val === undefined ? null : val);
  const start = normalizeTime(horainicio);
  const end = normalizeTime(horafin);

  const idofertante = req.user.idusuario; // viene del token

  if (!titulo) {
    return res
      .status(400)
      .json({ mensaje: "Faltan datos obligatorios (titulo)" });
  }

  if (start && end) {
    const s = Date.parse(`1970-01-01T${start}Z`);
    const e = Date.parse(`1970-01-01T${end}Z`);
    if (Number.isNaN(s) || Number.isNaN(e) || s >= e) {
      return res
        .status(400)
        .json({ mensaje: "La hora de inicio debe ser anterior a la hora de fin" });
    }
  }

  try {
    const dupTitulo = await pool.query(
      "SELECT 1 FROM actividad WHERE LOWER(titulo) = LOWER($1)",
      [titulo]
    );
    if (dupTitulo.rows.length > 0) {
      return res.status(400).json({ mensaje: "Ya existe una actividad con ese titulo" });
    }

    const ofertanteResult = await pool.query(
      "SELECT * FROM ofertante WHERE idusuario = $1",
      [idofertante]
    );

    if (ofertanteResult.rows.length === 0) {
      return res.status(400).json({ mensaje: "El ofertante no existe" });
    }

    const result = await pool.query(
      `INSERT INTO actividad
       (titulo, descripcion, tipo, fecha, disponibilidad, precio, plazas, horainicio, horafin, idofertante)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING idactividad`,
      [titulo, descripcion, tipo, fecha, disponibilidad, precio, plazas, start, end, idofertante]
    );

    res.status(201).json({
      mensaje: "Actividad creada correctamente",
      idactividad: result.rows[0].idactividad,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear actividad" });
  }
};

// Actividades de un ofertante (solo el propio ofertante)
const obtenerActividadesPorOfertante = async (req, res) => {
  const { id } = req.params;
  const idParam = parseInt(id, 10);

  if (req.user.tipousuario !== "ofertante" || req.user.idusuario !== idParam) {
    return res.status(403).json({
      mensaje: "Solo el ofertante propietario puede ver sus actividades",
    });
  }

  try {
    const result = await pool.query(
      `SELECT a.*,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'idinscripcion', i.idinscripcion,
                    'idconsumidor', i.idconsumidor,
                    'nombre', u.nombre,
                    'email', u.email,
                    'fechainscripcion', i.fechainscripcion
                  )
                ) FILTER (WHERE i.idinscripcion IS NOT NULL),
                '[]'
              ) AS inscritos
       FROM actividad a
       LEFT JOIN inscripcion i ON i.idactividad = a.idactividad
       LEFT JOIN usuario u ON u.idusuario = i.idconsumidor
       WHERE a.idofertante = $1
       GROUP BY a.idactividad`,
      [idParam]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener actividades del ofertante" });
  }
};

// Actualizar actividad (solo ofertante propietario)
const actualizarActividad = async (req, res) => {
  const { id } = req.params;
  const idactividad = parseInt(id, 10);

  const {
    titulo,
    descripcion,
    tipo,
    fecha,
    disponibilidad,
    precio,
    plazas,
  } = req.body;
  const { horainicio, horafin } = req.body;

  const normalizeTime = (val) => (val === "" || val === undefined ? null : val);

  try {
    const actResult = await pool.query(
      "SELECT * FROM actividad WHERE idactividad = $1",
      [idactividad]
    );

    if (actResult.rows.length === 0) {
      return res.status(404).json({ mensaje: "Actividad no encontrada" });
    }

    const actividad = actResult.rows[0];

    if (actividad.idofertante !== req.user.idusuario) {
      return res.status(403).json({
        mensaje: "No tienes permiso para editar esta actividad",
      });
    }

    const start = normalizeTime(horainicio ?? actividad.horainicio);
    const end = normalizeTime(horafin ?? actividad.horafin);
    if (start && end) {
      const s = Date.parse(`1970-01-01T${start}Z`);
      const e = Date.parse(`1970-01-01T${end}Z`);
      if (Number.isNaN(s) || Number.isNaN(e) || s >= e) {
        return res
          .status(400)
          .json({ mensaje: "La hora de inicio debe ser anterior a la hora de fin" });
      }
    }

    if (titulo) {
      const dupTitulo = await pool.query(
        "SELECT 1 FROM actividad WHERE LOWER(titulo) = LOWER($1) AND idactividad <> $2",
        [titulo, idactividad]
      );
      if (dupTitulo.rows.length > 0) {
        return res.status(400).json({ mensaje: "Ya existe una actividad con ese titulo" });
      }
    }

    const result = await pool.query(
      `UPDATE actividad
       SET titulo = $1,
           descripcion = $2,
           tipo = $3,
           fecha = $4,
           disponibilidad = $5,
           precio = $6,
           plazas = $7,
           horainicio = $8,
           horafin = $9
       WHERE idactividad = $10
       RETURNING *`,
      [
        titulo ?? actividad.titulo,
        descripcion ?? actividad.descripcion,
        tipo ?? actividad.tipo,
        fecha ?? actividad.fecha,
        disponibilidad ?? actividad.disponibilidad,
        precio ?? actividad.precio,
        plazas ?? actividad.plazas,
        start ?? null,
        end ?? null,
        idactividad,
      ]
    );

    res.json({
      mensaje: "Actividad actualizada correctamente",
      actividad: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar actividad" });
  }
};

// Borrar actividad (solo ofertante propietario)
const borrarActividad = async (req, res) => {
  const { id } = req.params;
  const idactividad = parseInt(id, 10);

  try {
    const actResult = await pool.query(
      "SELECT * FROM actividad WHERE idactividad = $1",
      [idactividad]
    );

    if (actResult.rows.length === 0) {
      return res.status(404).json({ mensaje: "Actividad no encontrada" });
    }

    const actividad = actResult.rows[0];

    if (actividad.idofertante !== req.user.idusuario) {
      return res.status(403).json({
        mensaje: "No tienes permiso para borrar esta actividad",
      });
    }

    await pool.query("DELETE FROM actividad WHERE idactividad = $1", [
      idactividad,
    ]);

    res.json({ mensaje: "Actividad eliminada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al borrar actividad" });
  }
};

module.exports = {
  obtenerActividades,
  crearActividad,
  obtenerActividadesPorOfertante,
  actualizarActividad,
  borrarActividad,
};
