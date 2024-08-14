const omit = require("../utils/omit");
const Room = require("../models/room.model");

const createRoom = async ({ name, host, members }) => {
  const payload = omit({
    name,
    host,
    members,
  });

  const newRoom = await Room.create(payload).then((doc) => {
    return doc.populate("members", "fullname username");
  });

  return {
    _id: newRoom._id,
    is_group: newRoom.is_group,
    members: newRoom.members,
  };
};

const getRoomByMembers = async ({ members }) => {
  const sortedMembers = [...members].sort();
  const room = await Room.findOne({ members: sortedMembers })
    .populate("members", "username fullname")
    .select("is_group members")
    .lean();

  if (!room) {
    console.log("create new room");
    return await createRoom({ members: sortedMembers });
  }

  return room;
};

const getRoomsByUserId = async ({ userId }) => {
  const room = await Room.find({ members: userId }).populate(
    "members",
    "fullname username"
  );

  return room;
};

module.exports = {
  createRoom,
  getRoomByMembers,
  getRoomsByUserId,
};
