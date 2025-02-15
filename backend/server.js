import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { Server } from "socket.io";
import http from "http";

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const gameSessions = {}; // Stores active sessions

// Handle WebRTC signaling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("start_game", (gameId) => {
    gameSessions[socket.id] = gameId;
    io.to(socket.id).emit("game_started", { message: "Game session started" });
  });

  socket.on("webrtc_offer", (data) => {
    io.to(data.target).emit("webrtc_offer", data);
  });

  socket.on("webrtc_answer", (data) => {
    io.to(data.target).emit("webrtc_answer", data);
  });

  socket.on("ice_candidate", (data) => {
    io.to(data.target).emit("ice_candidate", data);
  });

  socket.on("disconnect", () => {
    delete gameSessions[socket.id];
  });
});

server.listen(4000, () => console.log("Backend running on port 4000"));

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

  if (!result.rows.length || result.rows[0].password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Fetch Game Library (From IGDB)
app.get("/games", authenticate, async (req, res) => {
  const igdbResponse = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID,
      Authorization: `Bearer ${process.env.IGDB_API_KEY}`,
    },
    body: `fields name,cover.url,genres.name; where platforms = (49); limit 50;`,
  });

  const games = await igdbResponse.json();
  res.json(games);
});

// Start Server
app.listen(4000, () => console.log("Backend running on port 4000"));
