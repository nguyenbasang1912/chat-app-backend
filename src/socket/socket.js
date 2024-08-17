const express = require("express");
const { createServer } = require("http");
const { sendNotification } = require("../services/notification.service");
const { sendMessage } = require("../services/message.service");
const RoomService = require("../services/room.service");
const { Server } = require("socket.io");

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("../cert/serviceAccountKey.json")),
});

const app = express();
const server = createServer(app);
const io = new Server(server);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected: ", socket.handshake.query.userId);
  onlineUsers.set(socket.handshake.query.userId.toString(), socket.id);

  socket.broadcast.emit("partner reconnect", socket.handshake.query.userId);

  socket.on("join room", async (userIds) => {
    let room = await RoomService.getRoomByMembers({ members: userIds });


    room.members = room.members.map((mem) => {
      return {
        ...mem,
        isOnline: onlineUsers.has(mem._id.toString()),
      };
    });

    console.log("room", room);

    socket.join(room._id.toString());
    socket.emit("get room", room);
  });

  socket.on("leave room", (roomId) => {
    socket.leave(roomId);
  });

  socket.on(
    "send message",
    async (roomId, content, userId, partnerId, partnerFcmToken, myFcmToken) => {
      let sender = {};

      const message = await sendMessage(
        {
          userId,
          roomId,
          content,
        },
        (senderInfo) => {
          sender = senderInfo;
        }
      );

      // socket.to(roomId).emit("message", message);
      io.to(roomId).emit("message", message);

      try {
        const room = io.sockets.adapter.rooms.get(roomId);

        const partnerIsInRoom = Array.from(room).find((socketId) => {
          return socketId.toString() === onlineUsers.get(partnerId);
        });

        if (partnerIsInRoom) {
          return;
        }

        if (partnerFcmToken) {
          // send notification
          console.log("send noti");
          const msg = {
            data: {
              type: "message",
              title: sender.fullname,
              body: message.content,
              userId: userId,
              fcm: myFcmToken,
              roomId: roomId,
            },
            token: partnerFcmToken,
          };

          sendNotification(msg);
        }
      } catch (error) {
        console.log("error", error);
        return;
      }
    }
  );

  socket.on("disconnect", async () => {
    console.log("user disconnected: ", socket.handshake.query.userId);

    onlineUsers.delete(socket.handshake.query.userId);
    io.emit("online users", [...onlineUsers.values()]);
    const roomIds = await RoomService.getRoomsByMembers([
      socket.handshake.query.userId,
    ]);
    io.to(
      roomIds.map((room) => {
        return room._id.toString();
      })
    ).emit("partner offline", socket.handshake.query.userId);
  });
});

module.exports = {
  server,
  io,
  onlineUsers,
  app,
};
