const User = require("../models/user");
const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  NULL_FOUND,
  SUCCESS_CODE,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(NULL_FOUND).send(users))
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occured on the server" });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(NULL_FOUND).send(user))
    .catch((err) => {
      console.log(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "The requested document cannot be found" });
      } else if (err.name === "CastError") {
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
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => res.status(SUCCESS_CODE).send(user))
    .catch((err) => {
      console.log(err);
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

module.exports = { getUser, getUsers, createUser };
