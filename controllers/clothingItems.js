const Item = require("../models/clothingItem");
const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NULL_FOUND,
  SUCCESS_CODE,
  NOT_FOUND,
} = require("../utils/errors");

const getItems = (req, res) => {
  Item.find({})
    .then((items) => res.status(NULL_FOUND).send(items))
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;
  console.log(owner);

  Item.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(SUCCESS_CODE).send(item))
    .catch((err) => {
      console.log(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

const deleteItems = (req, res) => {
  const { itemId } = req.params;

  Item.findByIdAndDelete(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        return res.status(BAD_REQUEST).json({
          message: err.message,
        });
      } else if (item) {
        return res.send({ message: "Item deleted successfully" });
      }
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: err.message });
      } else if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

const likeItem = (req, res) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.json(item);
    })
    .catch((err) => {
      console.log(err);

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({
          message: err.message,
        });
      } else if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({
          message: err.message,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({
        message: err.message,
      });
    });
};

const dislikeItem = (req, res) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.json(item);
    })
    .catch((err) => {
      console.log(err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({
          message: err.message,
        });
      } else if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({
          message: err.message,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({
        message: err.message,
      });
    });
};

module.exports = { getItems, createItem, deleteItems, likeItem, dislikeItem };
