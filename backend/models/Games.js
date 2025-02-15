const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  name: String,
  cover: { url: String },
});

module.exports = mongoose.model("Game", GameSchema);
