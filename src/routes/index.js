const express = require("express");
const router = express.Router();

router.use("/auth", require("./user.route"));
router.use("/room", require("./room.route"));
router.use("/message", require("./message.route"));

module.exports = router;
