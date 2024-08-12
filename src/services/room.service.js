const omit = require("../utils/omit");
const Room = require("../models/room.model");

const createRoom = async ({ name, host, members }) => {
  const payload = omit({
    name,
    host,
    members,
  });

  const newRoom = await Room.create(payload);

  return newRoom;
};

const getRoomByMembers = async ({ members }) => {
  const sortedMembers = [...members].sort();
  const room = await Room.findOne({ members: sortedMembers });

  if (!room) {
    console.log("create new room");
    return await createRoom({ members: sortedMembers });
  }

  return room;
};

module.exports = {
  createRoom,
  getRoomByMembers,
};
