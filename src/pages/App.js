import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import "./App.css";
import { useNavigate } from "react-router-dom";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleAuth = async (endpoint) => {
    navigate("/Purchases");
  };

  return (
    <>
      <div className="auth-container">
        <h2>Login / Register</h2>
        <div className="input-wrapper">
          <FaUser className="input-icon" />
          <input
            name="email"
            type="text"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-wrapper">
          <FaLock className="input-icon" />
          <input
            name="password"
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button onClick={() => handleAuth("login")}>Login</button>
        <button onClick={() => handleAuth("register")}>Register</button>
      </div>
    </>
  );
}

export default App;
