import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

const GameLibrary = ({ token, startGame }) => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchGames = async () => {
      const response = await fetch(`${API_URL}/games`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setGames(data);
    };

    fetchGames();
  }, [token]);

  return (
    <div>
      <h1>Game Library</h1>
      {!token ? (
        <p>Please log in to see available games.</p>
      ) : (
        <ul>
          {games.map((game) => (
            <li key={game.id}>
              <img src={game.cover?.url} alt={game.name} />
              <p>{game.name}</p>
              <button onClick={() => startGame(game.id)}>Play</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GameLibrary;
