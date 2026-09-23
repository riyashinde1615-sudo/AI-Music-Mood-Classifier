import { useState } from "react";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>🎵 AI Music Mood Classifier</h1>

          <h2>🔐 Login</h2>

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
          />

          <button
            onClick={() => {
              if (username.trim() !== "") {
                setIsLoggedIn(true);
              }
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }
    return (
      <div className="app">

        <button
          className="logout-btn"
          onClick={() => setIsLoggedIn(false)}
        >
          🚪 Logout
        </button>

        <h1>🎵 AI Music Mood Classifier</h1>

        <p className="subtitle">
          Upload your music and lyrics to discover the mood using AI
        </p>

        <div className="card">

          <h2>🎧 Music Mood Detection</h2>

          <label>🎵 Upload Music</label>

          <input
            type="file"
            accept="audio/*"
          />

          <label>📝 Enter Lyrics</label>

          <textarea
            placeholder="Type or paste your song lyrics here..."
            rows="6"
          ></textarea>

          <button
            onClick={() => {
              const moods = [
                "Happy 😊",
                "Sad 😢",
                "Calm 😌",
                "Energetic ⚡",
                "Angry 😠"
              ];

              const randomMood =
                moods[Math.floor(Math.random() * moods.length)];

              alert("Detected Mood: " + randomMood);
            }}
          >
            🤖 Predict Mood
          </button>

        </div>
      </div>
    );
  }

  export default App;
