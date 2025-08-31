const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");
const { login, createUser } = require("./controllers/users");
const cors = require("cors");
const auth = require("./middlewares/auth");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connectd to DB");
  })
  .catch(console.error);

app.use(express.json());
app.use("/", mainRouter);
app.use(cors());

app.post("/signin", login);
app.post("/signup", createUser);

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
