const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index.js");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connectd to DB");
  })
  .catch(console.error);

app.use((req, res, next) => {
  req.user = {
    _id: "689e6839a4d4c5eebaed2659",
  };
  next();
});

app.use(express.json());
app.use("/", mainRouter);

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
