const express = require("express");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const path = require("path");
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

app.use("/api/", require("./routes"));
app.get("/test", (req, res, next) => {
  return res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
