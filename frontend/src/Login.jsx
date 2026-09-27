import React, { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">🎵</div>

        <h1>AI Music Mood Classifier</h1>

        <p className="login-subtitle">
          Login to analyze your music mood
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="login-button"
          >
            🔐 Login
          </button>

        </form>

        <p className="login-note">
          Don't have an account? Registration coming soon.
        </p>

      </div>
    </div>
  );
}

export default Login;
