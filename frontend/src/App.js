import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import Gamepad from "./Gamepad";
import AdminPanel from "./AdminPanel";

const API_URL = "http://localhost:4000";
const socket = io(API_URL);

const App = () => {
  const [games, setGames] = useState([]);
  const [token, setToken] = useState("");
  const [gameId, setGameId] = useState(null);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);

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

  const startGame = async (id) => {
    setGameId(id);
    socket.emit("start_game", id);

    peerConnection.current = new RTCPeerConnection();
    peerConnection.current.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", { target: id, candidate: event.candidate });
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("webrtc_offer", { target: id, offer });
  };

  const saveGame = async () => {
    await fetch(`${API_URL}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ gameId, saveData: "example_save_data" }),
    });
  };

  const loadGame = async () => {
    const response = await fetch(`${API_URL}/load/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    console.log("Loaded save:", data);
  };

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        {token && <Link to="/admin">Admin Panel</Link>}
      </nav>
      <Switch>
        <Route path="/" exact>
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
                    <button onClick={() => startGame(game.id)}>Play</button>
                  </li>
                ))}
              </ul>
            )}
            {gameId && (
              <div>
                <h2>Streaming Game...</h2>
                <video ref={videoRef} autoPlay playsInline></video>
                <button onClick={saveGame}>Save Game</button>
                <button onClick={loadGame}>Load Game</button>
                <Gamepad sendInput={(button, state) => socket.emit("game_input", { button, state })} />
              </div>
            )}
          </div>
        </Route>
        <Route path="/admin">
          <AdminPanel token={token} />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
