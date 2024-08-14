const express = require("express");
const router = express.Router();
const RoomComtroler = require("../controllers/room.controller");
const verifyUser = require("../middlewares/verifyUser.middleware");

router.post("/get-room-by-members", RoomComtroler.getRoomByMembers);
router.post("/get-rooms-by-user", verifyUser, RoomComtroler.getRoomsByUserId);

module.exports = router;
