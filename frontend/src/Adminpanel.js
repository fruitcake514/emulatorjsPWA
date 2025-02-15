import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:4000";

const AdminPanel = ({ token }) => {
  const [apiKeys, setApiKeys] = useState({});
  const [newUser, setNewUser] = useState({ username: "", password: "", isAdmin: false });

  useEffect(() => {
    const fetchKeys = async () => {
      const response = await fetch(`${API_URL}/admin/get-api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setApiKeys(data.reduce((acc, key) => ({ ...acc, [key.key]: key.value }), {}));
    };
    fetchKeys();
  }, [token]);

  const updateApiKey = async (key, value) => {
    await fetch(`${API_URL}/admin/set-api-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key, value }),
    });
    setApiKeys({ ...apiKeys, [key]: value });
  };

  const createUser = async () => {
    await fetch(`${API_URL}/admin/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newUser),
    });
    setNewUser({ username: "", password: "", isAdmin: false });
    alert("User created!");
  };

  return (
    <div>
      <h1>Admin Settings</h1>

      <h2>API Keys</h2>
      <input
        type="text"
        placeholder="IGDB API Key"
        value={apiKeys.IGDB_API_KEY || ""}
        onChange={(e) => updateApiKey("IGDB_API_KEY", e.target.value)}
      />
      <input
        type="text"
        placeholder="WebRTC API Key"
        value={apiKeys.WEBRTC_API_KEY || ""}
        onChange={(e) => updateApiKey("WEBRTC_API_KEY", e.target.value)}
      />

      <h2>Create User</h2>
      <input
        type="text"
        placeholder="Username"
        value={newUser.username}
        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={newUser.password}
        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
      />
      <label>
        Admin:
        <input
          type="checkbox"
          checked={newUser.isAdmin}
          onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
        />
      </label>
      <button onClick={createUser}>Create User</button>
    </div>
  );
};

export default AdminPanel;
