const Message = require("../models/messsage.model");
const Room = require("../models/room.model");

const sendMessage = async ({ userId, roomId, content }, onSuccess) => {
  const newMessage = await Message.create({
    sender: userId,
    content,
    room_id: roomId,
    is_delete: false,
  }).then((doc) => {
    return doc.populate("sender", "fullname username");
  });

  const message = {
    _id: newMessage._id,
    sender: newMessage.sender._id,
    content: newMessage.content,
    createdAt: newMessage.createdAt,
    is_delete: newMessage.is_delete,
    room_id: newMessage.room_id,
  };

  onSuccess(newMessage.sender);

  return message;
};


const deleteMessage = async ({ messageId }) => {
  const message = await Message.findOneAndUpdate(
    {
      _id: messageId,
    },
    {
      is_delete: true,
    },
    {
      new: true,
    }
  );

  return message;
};

const getMessagesByRoomId = async ({
  roomId,
  userId,
  page = 1,
  limit = 20,
  additionalSkip = 0,
}) => {
  const room = await Room.findOne({ _id: roomId }).lean();
  const deleteAt = room.delete_messsage.find((user) => {
    return userId === user.user_id.toString();
  })?.delete_at;

  if (!room) {
    const err = new Error("Not found room");
    err.status = 400;
    throw err;
  }

  const countMessage =
    (await Message.countDocuments({
      room_id: roomId,
      createdAt: {
        $gte: new Date(deleteAt),
      },
    })) - additionalSkip;

  const maxPages = Math.floor(countMessage / limit) || 1;
  const skip = (page - 1) * limit + parseInt(additionalSkip);

  const messages = await Message.find({
    room_id: roomId,
    createdAt: {
      $gte: new Date(deleteAt),
    },
  })
    .select("sender content createdAt is_delete room_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    messages,
    page: {
      maxPages,
      currentPage: page,
      hasNextPage: page * limit < countMessage,
      hasPreviousPage: page > 1,
    },
  };
};

module.exports = {
  sendMessage,
  deleteMessage,
  getMessagesByRoomId,
};
