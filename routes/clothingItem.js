const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItems,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");
const { validateItemBody } = require("../middlewares/validation");

router.get("/", getItems);
router.post("/", auth, validateItemBody, createItem);
router.delete("/:itemId", auth, deleteItems);

router.put("/:itemId/likes", auth, likeItem);
router.delete("/:itemId/likes", auth, dislikeItem);

module.exports = router;
