const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const validarCampos = require("../middleware/validation.middleware");
const { crearUsuario } = require("../controllers/usuarios.controller");

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

module.exports = router;
