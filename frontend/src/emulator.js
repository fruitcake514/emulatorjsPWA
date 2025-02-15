const express = require("express");
const socketIo = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Emulator connected");

  socket.on("game_input", (data) => {
    console.log("Game input received:", data);
  });

  socket.on("disconnect", () => {
    console.log("Emulator disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Emulator running on port ${PORT}`));
