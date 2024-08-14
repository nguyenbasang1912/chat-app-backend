require("dotenv").config();
const app = require("./src/app");
const { createServer } = require("http");
const connectDB = require("./src/configs/connectDB");
const { Server } = require("socket.io");
const MessageService = require("./src/services/message.service");
const RoomService = require("./src/services/room.service");

const server = createServer(app);
const port = process.env.PORT || 8000;
const io = new Server(server);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected: ", socket.handshake.query.userId);
  onlineUsers.set(socket.handshake.query.userId.toString(), socket.id);

  // io.emit("online users", [...onlineUsers.values()]);

  // socket.on("online users", () => {
  //   socket.emit("online users", [...onlineUsers.values()]);
  // });

  socket.on("join room", async (userIds) => {
    let room = await RoomService.getRoomByMembers({ members: userIds });

    room.members = room.members.map((mem) => {
      return {
        ...mem,
        isOnline: onlineUsers.has(mem._id.toString()),
      };
    });

    console.log("room id: ", room._id.toString());

    socket.join(room._id.toString());
    socket.emit("get room", room);
  });

  socket.on("leave room", (roomId) => {
    console.log("leave room: ", roomId);
    socket.leave(roomId);
  });

  socket.on("send message", async (roomId, content, userId) => {
    const message = await MessageService.sendMessage({
      userId,
      roomId,
      content,
    });

    // socket.to(roomId).emit("message", message);
    io.to(roomId).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);

    onlineUsers.delete(socket.handshake.query.userId);
    io.emit("online users", [...onlineUsers.values()]);
  });
});

server.listen(port, () => {
  connectDB()
    .then(() => {
      console.log("Connect db successfully");
    })
    .catch(console.log);
  console.log(`Server running on ${port}`);
});

module.exports = io;
