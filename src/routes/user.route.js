const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");

router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/renew-token", UserController.renewTokens);
router.get("/search", UserController.searchUsers);
router.post("/get-users", UserController.getUsers);

module.exports = router;
