const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItems,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");
const { validateItemBody, validateId } = require("../middlewares/validation");

router.get("/", getItems);
router.post("/", auth, validateItemBody, createItem);
router.delete("/:itemId", auth, validateId, deleteItems);

router.put("/:itemId/likes", auth, validateId, likeItem);
router.delete("/:itemId/likes", auth, validateId, dislikeItem);

module.exports = router;
