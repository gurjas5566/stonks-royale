import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./modal"; // Import the new Modal component

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setModalMessage(data.message);
        setModalVisible(true);
        navigate("/login");
      } else {
        setModalMessage(data.message || "Registration failed");
        setModalVisible(true);
      }
    } catch (error) {
      setModalMessage("Network error during registration.");
      setModalVisible(true);
    }
  };

  return (
    <div className="auth-container">
      {modalVisible && (
        <Modal message={modalMessage} onClose={() => setModalVisible(false)} />
      )}
      <h2>Register for Stonks Royale</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <div className="form-buttons">
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
