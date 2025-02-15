import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:4000";

const App = () => {
  const [games, setGames] = useState([]);
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      const response = await fetch(`${API_URL}/games`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setGames(data);
    };
    if (token) fetchGames();
  }, [token]);

  const handleLogin = async () => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "user", password: "pass" }),
    });

    const data = await response.json();
    setToken(data.token);
  };

  return (
    <div>
      <h1>Game Library</h1>
      {!token ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <ul>
          {games.map((game) => (
            <li key={game.id}>
              <img src={game.cover?.url} alt={game.name} />
              <p>{game.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
