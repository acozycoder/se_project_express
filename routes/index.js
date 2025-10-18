const router = require("express").Router();

const userRouter = require("./users");
const itemRouter = require("./clothingItem");
const NotFoundError = require("../errors/not-found-err");

router.use("/users", userRouter);
router.use("/items", itemRouter);

router.use("*", () => {
  throw new NotFoundError("Requested resource not found");
});

module.exports = router;
