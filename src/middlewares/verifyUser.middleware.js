require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  const accessToken = req.headers?.authorization?.split(" ")?.[1];

  if (!accessToken) {
    const err = new Error("Invalid authorization");
    err.status = 401;
    next(err);
  }

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.message === "invalid signature") {
        err.status = 403;
      } else if (err.message === "jwt expired") {
        err.status = 401;
      }
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

module.exports = verifyUser;
