require("dotenv").config();
const { server } = require("./src/socket/socket");
const connectDB = require("./src/configs/connectDB");
const express = require("express");
const morgan = require("morgan");
const {
  notFound,
  errorHandler,
} = require("./src/middlewares/error.middleware");
const path = require("path");
const { sendNotification } = require("./src/services/notification.service");
const { app } = require("./src/socket/socket");

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

app.use("/api/", require("./src/routes"));
app.get("/test", (req, res, next) => {
  return res.sendFile(path.join(__dirname, "/views/index.html"));
});
app.get("/test/messaging", (req, res, next) => {
  sendNotification();
  return res.send("success");
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8000;

server.listen(port, () => {
  connectDB()
    .then(() => {
      console.log("Connect db successfully");
    })
    .catch(console.log);
  console.log(`Server running on ${port}`);
});
