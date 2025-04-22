import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AuthForm({ type, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = type === "login" ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
      const { token } = res.data;
      localStorage.setItem("token", token);
      setToken(token);
      navigate("/"); // Redirect after login
    } catch (error) {
      console.error("Error during authentication:", error);
      alert("Authentication failed: " + error.response?.data?.message || "Unknown error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">{type === "login" ? "Login" : "Register"}</button>
    </form>
  );
}

export default AuthForm;
