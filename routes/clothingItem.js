const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItems,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");

router.get("/", getItems);
router.post("/", auth, createItem);
router.delete("/:itemId", auth, deleteItems);

router.put("/:itemId/likes", auth, likeItem);
router.delete("/:itemId/likes", auth, dislikeItem);

module.exports = router;
