const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const validarCampos = require("../middleware/validation.middleware");

const {
  crearInscripcion,
  obtenerInscripcionesPorConsumidor,
  cancelarInscripcion,
} = require("../controllers/inscripciones.controller");

const {
  authMiddleware,
  requireConsumidor,
} = require("../middleware/auth.middleware");

// POST inscripcion
router.post(
  "/",
  authMiddleware,
  requireConsumidor,
  [
    check("idactividad")
      .notEmpty()
      .withMessage("El id de la actividad es obligatorio")
      .isInt({ min: 1 })
      .withMessage("El id de la actividad debe ser un numero valido"),
    validarCampos,
  ],
  crearInscripcion
);

// GET inscripciones de un consumidor
router.get(
  "/consumidor/:id",
  authMiddleware,
  requireConsumidor,
  [
    check("id")
      .isInt({ min: 1 })
      .withMessage("El id de consumidor debe ser un numero entero valido"),
    validarCampos,
  ],
  obtenerInscripcionesPorConsumidor
);

// DELETE inscripcion
router.delete(
  "/:id",
  authMiddleware,
  requireConsumidor,
  [
    check("id")
      .isInt({ min: 1 })
      .withMessage("El id de inscripcion debe ser un entero valido"),
    validarCampos,
  ],
  cancelarInscripcion
);

module.exports = router;
