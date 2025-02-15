import React, { useState, useEffect } from "react";

const GameLibrary = ({ token }) => {
  const [roms, setRoms] = useState([]);
  
  useEffect(() => {
    fetch("http://localhost:4000/roms?system=nes", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setRoms);
  }, [token]);

  return (
    <div>
      <h1>Game Library</h1>
      {roms.map(rom => <button key={rom.id} onClick={() => startGame(rom.path)}>{rom.name}</button>)}
    </div>
  );
};

export default GameLibrary;
