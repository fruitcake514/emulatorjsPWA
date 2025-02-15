import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { Server } from "socket.io";
import http from "http";
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware for authentication
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Forbidden" });
  }
};

// *** USER AUTH ***
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  
  if (result.rows.length && bcrypt.compareSync(password, result.rows[0].password)) {
    const token = jwt.sign({ id: result.rows[0].id, is_admin: result.rows[0].is_admin }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// *** ADMIN PANEL: API KEYS & USER MANAGEMENT ***
app.post("/admin/set-api-key", authenticate, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Forbidden" });

  const { key, value } = req.body;
  await pool.query("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [key, value]);
  res.json({ message: "API key saved!" });
});

app.post("/admin/create-user", authenticate, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Forbidden" });

  const { username, password, isAdmin } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  await pool.query("INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)", [username, hashedPassword, isAdmin]);
  res.json({ message: "User created!" });
});

// *** ROM UPLOAD ***
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { system } = req.body;
    const uploadPath = path.join(__dirname, `roms/${system}`);
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.post("/admin/upload-rom", authenticate, upload.single("rom"), async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Forbidden" });

  const { system } = req.body;
  const romName = req.file.filename;
  await pool.query("INSERT INTO roms (name, system, path) VALUES ($1, $2, $3) ON CONFLICT (name, system) DO NOTHING", [romName, system, `/roms/${system}/${romName}`]);
  res.json({ message: "ROM uploaded successfully!" });
});

// *** GAME STREAMING: WebRTC Signaling ***
io.on("connection", (socket) => {
  socket.on("offer", (data) => socket.broadcast.emit("offer", data));
  socket.on("answer", (data) => socket.broadcast.emit("answer", data));
  socket.on("ice_candidate", (data) => socket.broadcast.emit("ice_candidate", data));
  socket.on("game_input", (data) => socket.broadcast.emit("game_input", data));
});

// *** START SERVER ***
server.listen(4000, () => console.log("Backend running on port 4000"));


app.post("/save", authenticate, async (req, res) => {
  const { gameId, saveData } = req.body;
  await pool.query(
    "INSERT INTO saves (user_id, game_id, data) VALUES ($1, $2, $3) ON CONFLICT (user_id, game_id) DO UPDATE SET data = EXCLUDED.data",
    [req.user.id, gameId, saveData]
  );
  res.json({ message: "Game saved!" });
});
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define storage for ROMs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { system } = req.body;
    const uploadPath = path.join(__dirname, `roms/${system}`);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Admin route to upload ROMs
app.post("/admin/upload-rom", authenticate, upload.single("rom"), async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Forbidden" });

  const { system } = req.body;
  const romName = req.file.filename;

  // Store in DB
  await pool.query(
    "INSERT INTO roms (name, system, path) VALUES ($1, $2, $3) ON CONFLICT (name, system) DO NOTHING",
    [romName, system, `/roms/${system}/${romName}`]
  );

  res.json({ message: "ROM uploaded successfully!" });
});

// Fetch list of ROMs
app.get("/roms", async (req, res) => {
  const { system } = req.query;
  const result = await pool.query("SELECT * FROM roms WHERE system = $1", [system]);
  res.json(result.rows);
});

app.get("/load/:gameId", authenticate, async (req, res) => {
  const { gameId } = req.params;
  const result = await pool.query(
    "SELECT data FROM saves WHERE user_id = $1 AND game_id = $2",
    [req.user.id, gameId]
  );

  if (result.rows.length > 0) {
    res.json({ saveData: result.rows[0].data });
  } else {
    res.status(404).json({ message: "No save found" });
  }
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const gameSessions = {}; // Stores active sessions
app.post("/save", authenticate, async (req, res) => {
  const { gameId, saveData } = req.body;
  await pool.query("INSERT INTO saves (user_id, game_id, data) VALUES ($1, $2, $3)",
    [req.user.id, gameId, saveData]);
  res.json({ message: "Game saved!" });
});
app.post("/admin/set-api-key", authenticate, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Forbidden" });

  const { key, value } = req.body;
  await pool.query("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [key, value]);
  res.json({ message: "API key saved!" });
});

app.get("/admin/get-api-keys", authenticate, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Forbidden" });

  const result = await pool.query("SELECT key, value FROM settings");
  res.json(result.rows);
});

app.post("/admin/create-user", authenticate, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Forbidden" });

  const { username, password, isAdmin } = req.body;
  await pool.query("INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)",
    [username, password, isAdmin]);
  res.json({ message: "User created!" });
});

app.get("/load/:gameId", authenticate, async (req, res) => {
  const { gameId } = req.params;
  const result = await pool.query("SELECT data FROM saves WHERE user_id = $1 AND game_id = $2",
    [req.user.id, gameId]);
  
  if (result.rows.length > 0) {
    res.json({ saveData: result.rows[0].data });
  } else {
    res.status(404).json({ message: "No save found" });
  }
});

// Handle WebRTC signaling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("start_game", (gameId) => {
    gameSessions[socket.id] = gameId;
    io.to(socket.id).emit("game_started", { message: "Game session started" });
  });
socket.on("game_input", (data) => {
  io.to(gameSessions[socket.id]).emit("game_input", data);
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
