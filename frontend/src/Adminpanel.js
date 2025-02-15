import React, { useState } from "react";

const API_URL = "http://localhost:4000";

const AdminPanel = ({ token }) => {
  const [romFile, setRomFile] = useState(null);
  const [system, setSystem] = useState("");

  const uploadRom = async () => {
    const formData = new FormData();
    formData.append("rom", romFile);
    formData.append("system", system);

    await fetch(`${API_URL}/admin/upload-rom`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    alert("ROM uploaded!");
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <h3>Upload ROM</h3>
      <select onChange={(e) => setSystem(e.target.value)}>
        <option value="">Select System</option>
        <option value="nes">NES</option>
        <option value="snes">SNES</option>
        <option value="ps1">PS1</option>
      </select>
      <input type="file" onChange={(e) => setRomFile(e.target.files[0])} />
      <button onClick={uploadRom}>Upload ROM</button>
    </div>
  );
};

export default AdminPanel;
