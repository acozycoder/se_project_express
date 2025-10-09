const errorHandler = (err, req, res, next) => {
  console.error(err);
  return res.status(500).send({ message: err.message });
};

module.exports = errorHandler;
