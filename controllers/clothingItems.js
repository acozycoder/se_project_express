const { BadRequestError, ForbiddenError, NotFoundError } = require("../errors");
const Item = require("../models/clothingItem");
const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  SUCCESS_CODE,
  NOT_FOUND,
  WRONG_USER,
} = require("../utils/errors");

const getItems = (req, res) => {
  Item.find({})
    .then((items) => res.send(items))
    .catch(() => {
      next(err);
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
        next(new BadRequestError("Item validation failed"));
      }
      next(err);
    });
};

const deleteItems = (req, res) => {
  const { itemId } = req.params;

  Item.findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        next(new ForbiddenError("You can only delete your own items"));
      }

      return Item.findByIdAndDelete(itemId).then(() =>
        res.send({ message: "Item deleted successfully" })
      );
    })

    .catch((err) => {
      console.log(err);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("The requested document cannot be found"));
      }
      if (err.name === "CastError") {
        next(new BadRequestError("Cast to obectId failed"));
      }
      next(err);
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
        next(new BadRequestError("Cast to obectId failed"));
      }
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("The requested document cannot be found"));
      }
      next(err);
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
        next(new NotFoundError("The requested document cannot be found"));
      }
      if (err.name === "CastError") {
        next(new BadRequestError("Cast to obectId failed"));
      }
      next(err);
    });
};

module.exports = { getItems, createItem, deleteItems, likeItem, dislikeItem };
