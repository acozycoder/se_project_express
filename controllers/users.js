const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  USER_ERROR,
  AUTHORIZATION_ERROR,
} = require("../utils/errors");
const bcrypt = require("bcryptjs");

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.log(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Cast to objectId failed" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occured on the server" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      return User.create({ name, avatar, email, password: hash });
    })
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;

      res.status(200).json(userObj);
    })
    .catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        return res.status(USER_ERROR).json({
          message: "A user with this email already exists.",
        });
      }
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "User validation failed" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occured on the server" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).json({ token });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "Incorrect email or password") {
        return res
          .status(AUTHORIZATION_ERROR)
          .send({ message: "Incorrect email or password" });
      }
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "User validation failed" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occured on the server" });
    });
};

const updateProfile = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (avatar !== undefined) updates.avatar = avatar;

  User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).json({ message: "User not found" });
      }

      res.status(200).json(user);
    })
    .catch((err) => {
      console.log(err);

      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({
          message: "Data provided invalided",
        });
      }

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({
          message: "Invalid user ID",
        });
      }

      res.status(INTERNAL_SERVER_ERROR).json({
        message: "An error has occured on the server",
      });
    });
};

module.exports = { getCurrentUser, createUser, login, updateProfile };
