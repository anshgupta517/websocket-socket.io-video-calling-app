const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

const io = new Server({ cors: true });
const app = express();

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("a new user connection");
  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log(`user ${emailId} joined`);
    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailMapping.set(socket.id, emailId);
    socket.emit("user:join", { emailId, roomId });
    socket.join(roomId);
    io.to(roomId).emit("user-joined", { emailId, id: socket.id });
  });

  socket.on("call-user", (data) => {
    const { newUserId, offer } = data;
    io.to(newUserId).emit("incoming-call", {
      existingUserId: socket.id,
      offer,
    });
  });

  socket.on("call-accepted", (data) => {
    const { existingUserId, ans } = data;
    socket.to(existingUserId).emit("call-finalised", { ans });
  });

  socket.on("disconnect", () => {
    const emailId = socketToEmailMapping.get(socket.id);
    if (emailId) {
      emailToSocketMapping.delete(emailId);
      socketToEmailMapping.delete(socket.id);
    }
    console.log("disconnect");
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});

io.listen(8001);
