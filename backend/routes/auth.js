const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const gameRoutes = require("./routes/games");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/games", gameRoutes);

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("start_game", (gameId) => {
    console.log(`Starting game ${gameId}`);
    io.emit("game_started", gameId);
  });

  socket.on("game_input", (data) => {
    console.log("Input received:", data);
    io.emit("game_input", data);
  });

  socket.on("webrtc_offer", (data) => {
    io.emit("webrtc_offer", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
