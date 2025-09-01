const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRouter = require("./routes/index");
const { login, createUser } = require("./controllers/users");
const auth = require("./middlewares/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/signup", createUser);
app.post("/signin", login);

app.use("/", mainRouter);

const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connectd to DB");
  })
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
