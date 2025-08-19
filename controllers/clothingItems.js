const Item = require("../models/clothingItem");
const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  SUCCESS_CODE,
  NOT_FOUND,
} = require("../utils/errors");

const getItems = (req, res) => {
  Item.find({})
    .then((items) => res.status(200).send(items))
    .catch(() => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occured on the server" });
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
        return res
          .status(BAD_REQUEST)
          .send({ message: "Item validation failed" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occured on the server" });
    });
};

const deleteItems = (req, res) => {
  const { itemId } = req.params;

  Item.findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        return res.status(BAD_REQUEST).json({
          message: "You can only delete your own items",
        });
      }

      return Item.findByIdAndDelete(itemId);
    })
    .then(() => res.send({ message: "Item deleted successfully" }))
    .catch((err) => {
      console.log(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "The requested document cannot be found" });
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
          message: "Cast to objectId failed",
        });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({
          message: "The requested document cannot be found",
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({
        message: "An error has occured on the server",
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
          message: "The requested document cannot be found",
        });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({
          message: "Cast to objectId failed",
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({
        message: "An error has occured on the server",
      });
    });
};

module.exports = { getItems, createItem, deleteItems, likeItem, dislikeItem };
