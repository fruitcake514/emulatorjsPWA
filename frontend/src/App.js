import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

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
