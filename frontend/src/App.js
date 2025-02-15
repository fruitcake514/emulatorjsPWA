import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Gamepad from "./Gamepad";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import AdminPanel from "./AdminPanel";

<Router>
  <nav>
    <Link to="/">Home</Link>
    {isAdmin && <Link to="/admin">Admin Panel</Link>}
  </nav>
  <Switch>
    <Route path="/" exact component={GameLibrary} />
    <Route path="/admin" component={() => <AdminPanel token={token} />} />
  </Switch>
</Router>

const sendInput = (button, state) => {
  socket.emit("game_input", { button, state });
};

// Inside the return statement:
{gameId && <Gamepad sendInput={sendInput} />}

const API_URL = "http://localhost:4000";
const socket = io(API_URL);
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

// Inside the return statement:
{gameId && (
  <>
    <button onClick={saveGame}>Save Game</button>
    <button onClick={loadGame}>Load Game</button>
  </>
)}

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
    
    // WebRTC setup
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
              <button onClick={() => startGame(game.id)}>Play</button>
            </li>
          ))}
        </ul>
      )}
      {gameId && (
        <div>
          <h2>Streaming Game...</h2>
          <video ref={videoRef} autoPlay playsInline></video>
        </div>
      )}
    </div>
  );
};

export default App;
