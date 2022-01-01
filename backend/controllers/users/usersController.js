const { validationResult } = require("express-validator");

const {
  hashedPassword,
  createToken,
  comparePassword,
} = require("../../services/authServices");
const UserModel = require("../../models/User");

// @route OST /api/register
// @access Public
// @desc Create user and return a token
module.exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    const { name, email, password } = req.body;
    try {
      const emailExist = await UserModel.findOne({ email });
      if (!emailExist) {
        const hashed = await hashedPassword(password);
        const user = await UserModel.create({
          name,
          email,
          password: hashed,
          admin: true,
        });
        const token = createToken({ id: user._id, name: user.name });
        return res
          .status(201)
          .json({ msg: "Your Account has been created", token });
      } else {
        //email already taken
        return res
          .status(401)
          .json({ errors: [{ msg: `${email} is already taken` }] });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json("Server internal error!");
    }
  } else {
    // validation failed
    return res.status(400).json({ errors: errors.array() });
  }
};

// @route OST /api/login
// @access Public
// @desc login user and return a token

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    try {
      const user = await UserModel.findOne({ email });
      if (user) {
        if (await comparePassword(password, user.password)) {
          const token = createToken({ id: user._id, name: user.name });
          if (user.admin) {
            return res.status(201).json({ token, admin: true });
          } else {
            return res.status(201).json({ token, admin: false });
          }
        } else {
          return res
            .status(401)
            .json({ email: [{ msg: "password not matched" }] });
        }
      } else {
        return res
          .status(401)
          .json({ errors: [{ msg: `${email} is Not found!` }] });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json("server internal error");
    }
  } else {
    //validation failed
    return res.status(401).json({ errors: errors.array() });
  }
};
