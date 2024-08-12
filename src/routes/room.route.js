const express = require("express");
const router = express.Router();
const RoomComtroler = require("../controllers/room.controller");

router.post("/get-room-by-members", RoomComtroler.getRoomByMembers);

module.exports = router;
