const { getGames } = require("../models/Game");

const getAllGames = async (req, res) => {
  try {
    const games = await getGames();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch games" });
  }
};

module.exports = { getAllGames };
