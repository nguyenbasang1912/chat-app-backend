const Message = require("../models/messsage.model");
const Room = require("../models/room.model");

const sendMessage = async ({
  userId,
  roomId,
  content,
  isSendNotification = false,
}) => {
  const newMessage = await Message.create({
    sender: userId,
    content,
    room_id: roomId,
    is_delete: false,
  });

  if (isSendNotification) {
    // Send notification to room members
  }

  return {
    _id: newMessage._id,
    sender: newMessage.sender,
    content: newMessage.content,
    createdAt: newMessage.createdAt,
    is_delete: newMessage.is_delete,
    room_id: newMessage.room_id,
  };
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

  const countMessage = await Message.countDocuments({
    room_id: roomId,
    createdAt: {
      $gte: new Date(deleteAt),
    },
  });

  const maxPages = Math.floor(countMessage / limit) || 1;
  const skip = (page - 1) * limit;

  const messages = await Message.find({
    room_id: roomId,
    createdAt: {
      $gte: new Date(deleteAt),
    },
  })
    .select("")
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
