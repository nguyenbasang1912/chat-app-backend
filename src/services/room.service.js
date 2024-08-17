const omit = require("../utils/omit");
const Room = require("../models/room.model");

const createRoom = async ({ name, host, members }) => {
  const payload = omit({
    name,
    host,
    members,
  });

  const newRoom = (
    await Room.create(payload).then((doc) => {
      return doc.populate("members", "fullname username fcm_token");
    })
  ).toObject();

  const room = {
    _id: newRoom._id,
    is_group: newRoom.is_group,
    members: newRoom.members,
  };

  console.log("createRoom", room);

  return room;
};

const getRoomByMembers = async ({ members }) => {
  const sortedMembers = [...members].sort();
  const room = await Room.findOne({ members: sortedMembers })
    .populate("members", "username fullname fcm_token")
    .select("is_group members")
    .lean();

  if (!room) {
    return await createRoom({ members: sortedMembers });
  }

  console.log("room: ", room);

  return room;
};

const getRoomsByUserId = async ({ userId }) => {
  const room = await Room.find({ members: userId }).populate(
    "members",
    "fullname username"
  );

  return room;
};

const getRoomsByMembers = async (userIds = []) => {
  const rooms = await Room.find({ members: { $in: userIds } })
    .select("_id")
    .lean();

  return rooms;
};

module.exports = {
  createRoom,
  getRoomByMembers,
  getRoomsByUserId,
  getRoomsByMembers,
};
