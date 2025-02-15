const uploadRom = (req, res) => {
  console.log("ROM uploaded successfully");
  res.json({ message: "ROM uploaded successfully" });
};

module.exports = { uploadRom };
