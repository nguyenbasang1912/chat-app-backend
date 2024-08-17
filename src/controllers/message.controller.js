const asyncHandler = require("../utils/asyncHandler");
const SuccessResponse = require("../utils/response");
const MessageService = require("../services/message.service");
const Message = require("../models/messsage.model");
const Room = require("../models/room.model");
const { io, onlineUsers } = require("../socket/socket");
const { sendNotification } = require("../services/notification.service");

const sendMessageInNotifications = async ({ roomId, content, partnerId }) => {
  const room = await Room.findOne({ _id: roomId })
    .populate("members", "fcm_token fullname")
    .lean();

  if (!room) {
    const err = new Error("Room not found");
    err.status = 400;
    throw err;
  }

  const partnerInfo = room.members.find((mem) => {
    return mem._id.toString() === partnerId.toString();
  });

  const userInfo = room.members.find((mem) => {
    return mem._id.toString() !== partnerId.toString();
  });

  const message = await Message.create({
    content,
    sender: userInfo._id,
    room_id: roomId,
  });

  try {
    io.to(roomId).emit("message", message);

    const send = () => {
      const msg = {
        data: {
          type: "message",
          title: userInfo.fullname,
          body: message.content,
          userId: userInfo._id.toString(),
          roomId: roomId,
          fcm: userInfo.fcm_token,
        },
        token: partnerInfo.fcm_token,
      };

      sendNotification(msg);
    };

    const room = io.sockets.adapter.rooms.get(roomId);

    if (!room) {
      send();
      return;
    }

    const partnerIsInRoom = Array.from(room).find((socketId) => {
      return socketId.toString() === onlineUsers.get(partnerId);
    });

    if (!partnerIsInRoom) {
      send();
    }
  } catch (err) {
    console.log("Error sending message", err);
    throw err;
  }
};

const getMessages = asyncHandler(async (req, res) => {
  const query = req.query;
  const { user_id: userId } = req.user;

  const body = {
    ...query,
    userId,
  };

  new SuccessResponse({
    message: "Messages retrieved successfully",
    status: 200,
    data: await MessageService.getMessagesByRoomId(body),
  }).json(res);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { roomId, content, userId: partnerId } = req.body;
  new SuccessResponse({
    message: "Message sent successfully",
    status: 200,
    data: await sendMessageInNotifications({
      roomId,
      partnerId,
      content,
    }),
  }).json(res);
});

module.exports = {
  getMessages,
  sendMessage,
};
