const express = require("express");
const { register, login } = require("../../controllers/users/usersController");
const {
  registerValidations,
  loginValidations,
} = require("../../Validations/userValidations");
const router = express.Router();

router.post("/register", registerValidations, register);

router.post("/login", loginValidations, login);

module.exports = router;
