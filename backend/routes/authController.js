const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key";

const login = (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    const token = jwt.sign({ username, isAdmin: true }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ token, isAdmin: true });
  }

  return res.status(401).json({ message: "Invalid credentials" });
};

module.exports = { login };
