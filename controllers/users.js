const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} = require("../errors");

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.send({ user }))
    .catch((err) => {
      console.log(err);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        next(new BadRequestError("Cast to objectId failed"));
      }
      next(err);
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;

      return res.json(userObj);
    })
    .catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        next(new ConflictError("A user with this email already exists"));
      }
      if (err.name === "ValidationError") {
        next(new BadRequestError("User validation failed"));
      }
      next(err);
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new BadRequestError("Please enter your email and password"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.json({ token });
    })
    .catch((err) => {
      console.log(err);
      if (err.message === "Incorrect email or password") {
        next(new UnauthorizedError("Incorrect email or password"));
      }
      if (err.name === "ValidationError") {
        next(new BadRequestError("User validation failed"));
      }
      next(err);
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
        next(new NotFoundError("User not found"));
      }

      return res.json(user);
    })
    .catch((err) => {
      console.log(err);

      if (err.name === "ValidationError") {
        next(new BadRequestError("Data provided invalid"));
      }

      if (err.name === "CastError") {
        next(new BadRequestError("Invalid user ID"));
      }

      next(err);
    });
};

module.exports = { getCurrentUser, createUser, login, updateProfile };
