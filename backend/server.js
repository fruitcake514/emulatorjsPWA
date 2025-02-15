const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const db = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/admin", require("./routes/admin"));
app.use("/games", require("./routes/games"));

// Socket.io for game control
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("start_game", (gameId) => {
    io.emit("game_started", gameId);
  });

  socket.on("game_input", (data) => {
    io.emit("game_input", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
