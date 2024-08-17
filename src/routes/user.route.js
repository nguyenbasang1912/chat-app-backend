const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const verifyUser = require("../middlewares/verifyUser.middleware");

router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/renew-tokens", UserController.renewTokens);
router.get("/search", UserController.searchUsers);
router.post("/get-users", UserController.getUsers);
router.get("/get-all-users", verifyUser, UserController.getAllUsers);
router.post("/update-fcm", verifyUser, UserController.updateFcm);
router.post("/logout", verifyUser, UserController.logout);

module.exports = router;
