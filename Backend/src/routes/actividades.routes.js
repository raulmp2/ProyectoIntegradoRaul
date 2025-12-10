// Backend/src/routes/actividades.routes.js
const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const validarCampos = require("../middleware/validation.middleware");
const {
  obtenerActividades,
  crearActividad,
  obtenerActividadesPorOfertante,
  actualizarActividad,
  borrarActividad,
} = require("../controllers/actividades.controller");

const { authMiddleware, requireOfertante } = require("../middleware/auth.middleware");

const allowedTipos = [
  "Ruta en bici por el río Guadalquivir",
  "Visita al Real Alcázar de Sevilla",
  "Partida de juegos de rol (D&D, Pathfinder, etc.)",
  "Paseo fotográfico por el Barrio de Santa Cruz",
  "Tarde de escape room",
  "Kayak o piragua por la dársena de Sevilla",
  "Tour gastronómico por tapas",
  "Tarde de juegos de mesa en cafetería temática",
  "Observación de estrellas en las afueras",
  "Clases o sesión de baile (sevillanas, salsa o bachata)",
];

const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/; // HH:MM or HH:MM:SS
const currentYear = new Date().getFullYear();

// GET /actividades (publico)
router.get("/", obtenerActividades);

// GET /actividades/ofertante/:id (solo el ofertante autenticado)
router.get(
  "/ofertante/:id",
  authMiddleware,
  requireOfertante,
  [
    check("id").isInt({ min: 1 }).withMessage("El id de ofertante debe ser un numero entero valido"),
    validarCampos,
  ],
  obtenerActividadesPorOfertante
);

// POST /actividades - Crear actividad (solo ofertante)
router.post(
  "/",
  authMiddleware,
  requireOfertante,
  [
    check("titulo").notEmpty().withMessage("El titulo es obligatorio"),

    check("descripcion")
      .optional({ checkFalsy: true, nullable: true })
      .isString()
      .withMessage("La descripcion debe ser texto"),

    check("tipo")
      .notEmpty()
      .withMessage("El tipo es obligatorio")
      .customSanitizer((v) => (typeof v === "string" ? v.trim() : v))
      .custom((v) => allowedTipos.includes(v))
      .withMessage("El tipo debe ser uno de los valores permitidos"),

    check("fecha")
      .optional({ checkFalsy: true, nullable: true })
      .isISO8601()
      .withMessage("La fecha debe tener formato valido YYYY-MM-DD")
      .custom((v) => {
        const y = new Date(v).getFullYear();
        return y >= currentYear && y <= currentYear + 2;
      })
      .withMessage("El año debe ser el actual o como máximo dos años más"),

    check("disponibilidad")
      .optional({ checkFalsy: true, nullable: true })
      .isString()
      .withMessage("La disponibilidad debe ser texto"),

    check("horainicio")
      .notEmpty()
      .withMessage("La hora de inicio es obligatoria")
      .matches(timeRegex)
      .withMessage("Formato de hora invalido (HH:MM o HH:MM:SS)"),

    check("horafin")
      .notEmpty()
      .withMessage("La hora de fin es obligatoria")
      .matches(timeRegex)
      .withMessage("Formato de hora invalido (HH:MM o HH:MM:SS)"),

    check("precio")
      .optional({ checkFalsy: true, nullable: true })
      .isFloat({ min: 0 })
      .withMessage("El precio debe ser un numero mayor o igual a 0"),

    check("plazas")
      .optional({ checkFalsy: true, nullable: true })
      .isInt({ min: 1 })
      .withMessage("Las plazas deben ser un numero entero mayor o igual a 1"),

    validarCampos,
  ],
  crearActividad
);

// PUT /actividades/:id - Actualizar actividad (solo ofertante dueno)
router.put(
  "/:id",
  authMiddleware,
  requireOfertante,
  [
    check("id").isInt({ min: 1 }).withMessage("El id de actividad debe ser un numero entero valido"),

    check("titulo")
      .optional({ checkFalsy: true, nullable: true })
      .notEmpty()
      .withMessage("El titulo no puede estar vacio"),

    check("descripcion")
      .optional({ checkFalsy: true, nullable: true })
      .isString()
      .withMessage("La descripcion debe ser texto"),

    check("tipo")
      .optional({ checkFalsy: true, nullable: true })
      .customSanitizer((v) => (typeof v === "string" ? v.trim() : v))
      .custom((v) => allowedTipos.includes(v))
      .withMessage("El tipo debe ser uno de los valores permitidos"),

    check("fecha")
      .optional({ checkFalsy: true, nullable: true })
      .isISO8601()
      .withMessage("La fecha debe tener un formato valido YYYY-MM-DD")
      .custom((v) => {
        const y = new Date(v).getFullYear();
        return y >= currentYear && y <= currentYear + 2;
      })
      .withMessage("El año debe ser el actual o como máximo dos años más"),

    check("disponibilidad")
      .optional({ checkFalsy: true, nullable: true })
      .isString()
      .withMessage("La disponibilidad debe ser texto"),

    check("horainicio")
      .optional({ checkFalsy: true, nullable: true })
      .matches(timeRegex)
      .withMessage("Formato de hora invalido (HH:MM o HH:MM:SS)"),

    check("horafin")
      .optional({ checkFalsy: true, nullable: true })
      .matches(timeRegex)
      .withMessage("Formato de hora invalido (HH:MM o HH:MM:SS)"),

    check("precio")
      .optional({ checkFalsy: true, nullable: true })
      .isFloat({ min: 0 })
      .withMessage("El precio debe ser un numero mayor o igual a 0"),

    check("plazas")
      .optional({ checkFalsy: true, nullable: true })
      .isInt({ min: 1 })
      .withMessage("Las plazas deben ser un numero entero mayor o igual a 1"),

    validarCampos,
  ],
  actualizarActividad
);

// DELETE /actividades/:id - Borrar actividad (solo ofertante dueno)
router.delete(
  "/:id",
  authMiddleware,
  requireOfertante,
  [
    check("id").isInt({ min: 1 }).withMessage("El id de actividad debe ser un numero entero valido"),
    validarCampos,
  ],
  borrarActividad
);

module.exports = router;
