const getGames = (req, res) => {
  const games = [
    { id: 1, name: "Super Mario Bros", cover: { url: "https://example.com/mario.jpg" } },
    { id: 2, name: "Street Fighter II", cover: { url: "https://example.com/sf2.jpg" } },
    { id: 3, name: "Final Fantasy VII", cover: { url: "https://example.com/ff7.jpg" } },
  ];
  
  res.json(games);
};

module.exports = { getGames };
