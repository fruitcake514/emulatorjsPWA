import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import GameLibrary from "./GameLibrary";
import AdminPanel from "./AdminPanel";
import Gamepad from "./Gamepad";

const API_URL = "http://localhost:4000";
const socket = io(API_URL);

const App = () => {
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameId, setGameId] = useState(null);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      const response = await fetch(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    };
    
    fetchUser();
  }, [token]);

  const handleLogin = async () => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "password" }),
    });

    const data = await response.json();
    setToken(data.token);
    setIsAdmin(data.isAdmin);
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

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        {isAdmin && <Link to="/admin">Admin Panel</Link>}
      </nav>
      <Switch>
        <Route path="/" exact>
          <GameLibrary token={token} startGame={startGame} />
        </Route>
        <Route path="/admin">
          <AdminPanel token={token} />
        </Route>
      </Switch>
      {gameId && (
        <div>
          <h2>Streaming Game...</h2>
          <video ref={videoRef} autoPlay playsInline></video>
          <Gamepad sendInput={(button, state) => socket.emit("game_input", { button, state })} />
        </div>
      )}
    </Router>
  );
};

export default App;
