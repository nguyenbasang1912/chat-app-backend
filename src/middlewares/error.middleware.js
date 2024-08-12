require("dotenv").config();

const notFound = (req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  return res.status(err.status || 500).json({
    message: err.message,
    error: process.env.ENV === "dev" ? err.stack : {}, // Only include error details in development mode.
  });
};

module.exports = { notFound, errorHandler };
