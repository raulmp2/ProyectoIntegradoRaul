const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const validarCampos = require("../middleware/validation.middleware");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  crearUsuario,
  actualizarNombre,
  borrarUsuario,
} = require("../controllers/usuarios.controller");

router.post(
  "/",
  [
    check("nombre").notEmpty().withMessage("El nombre es obligatorio"),

    check("email").isEmail().withMessage("El email no es valido"),

    check("contrasena")
      .isLength({ min: 6 })
      .withMessage("La contrasena debe tener minimo 6 caracteres"),

    check("tipousuario")
      .isIn(["ofertante", "consumidor"])
      .withMessage("El tipo de usuario debe ser ofertante o consumidor"),

    validarCampos,
  ],
  crearUsuario
);

router.put(
  "/:id",
  authMiddleware,
  [
    check("id")
      .isInt({ min: 1 })
      .withMessage("El id de usuario debe ser un numero entero valido"),
    check("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    validarCampos,
  ],
  actualizarNombre
);

router.delete(
  "/:id",
  authMiddleware,
  [
    check("id")
      .isInt({ min: 1 })
      .withMessage("El id de usuario debe ser un numero entero valido"),
    validarCampos,
  ],
  borrarUsuario
);

module.exports = router;
