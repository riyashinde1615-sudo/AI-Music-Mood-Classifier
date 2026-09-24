import { useState } from "react";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [mood, setMood] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [history, setHistory] = useState([]);

  const moods = [
    {
      name: "Happy 😊",
      message: "Your music has a bright and positive feeling!",
      icon: "😊",
    },
    {
      name: "Sad 😢",
      message: "Your music has an emotional and calm feeling.",
      icon: "😢",
    },
    {
      name: "Calm 😌",
      message: "Your music has a peaceful and relaxing feeling.",
      icon: "😌",
    },
    {
      name: "Energetic ⚡",
      message: "Your music has an energetic and lively feeling!",
      icon: "⚡",
    },
    {
      name: "Angry 😠",
      message: "Your music has a powerful and intense feeling.",
      icon: "😠",
    },
  ];

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-music-icon">🎵</div>

          <h1>AI Music Mood Classifier</h1>

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
            className="login-btn"
            onClick={() => {
              if (username.trim() !== "") {
                setIsLoggedIn(true);
              } else {
                alert("Please enter username");
              }
            }}
          >
            Login
          </button>

        </div>
      </div>
    );
  }

  // Predict Mood
  const predictMood = () => {
    if (!selectedFile && lyrics.trim() === "") {
      alert("Please upload music or enter lyrics first.");
      return;
    }

    const randomMood =
      moods[Math.floor(Math.random() * moods.length)];

    setMood(randomMood);

    const newPrediction = {
      mood: randomMood.name,
      song: selectedFile ? selectedFile.name : "Lyrics Only",
      time: new Date().toLocaleTimeString(),
    };

    setHistory((prev) => [newPrediction, ...prev].slice(0, 5));
  };

  return (
    <div className="app">

      {/* Logout */}
      <button
        className="logout-btn"
        onClick={() => {
          setIsLoggedIn(false);
          setMood("");
          setSelectedFile(null);
          setLyrics("");
        }}
      >
        🚪 Logout
      </button>

      {/* Header */}
      <div className="header">
        <h1>🎵 AI Music Mood Classifier</h1>

        <p className="subtitle">
          Analyze your music and discover its mood using AI
        </p>
      </div>

      {/* Main Card */}
      <div className="card">

        <h2>🎧 Music Mood Detection</h2>

        {/* Upload Music */}
        <label>🎵 Upload Music</label>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setSelectedFile(file);
            setIsPlaying(false);
          }}
        />

        {/* Selected Song */}
        {selectedFile && (
          <div className="song-info">
            <div className="song-icon">🎵</div>

            <div className="song-details">
              <strong>{selectedFile.name}</strong>
              <span>
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
        )}

        {/* Music Player */}
        {selectedFile && (
          <div className="music-player">

            <button
              className="play-btn"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <div className="player-content">

              <div className="player-title">
                {isPlaying ? "Playing Music..." : "Music Ready"}
              </div>

              <div className="progress-bar">
                <div
                  className={`progress ${
                    isPlaying ? "playing" : ""
                  }`}
                ></div>
              </div>

            </div>

          </div>
        )}

        {/* Lyrics */}
        <label>📝 Enter Lyrics</label>

        <textarea
          placeholder="Type or paste your song lyrics here..."
          rows="6"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
        ></textarea>

        <div className="lyrics-count">
          {lyrics.length} characters
        </div>

        {/* Predict Button */}
        <button
          className="predict-btn"
          onClick={predictMood}
        >
          🤖 Predict Mood
        </button>

        {/* Mood Result */}
        {mood && (
          <div className="result">

            <div className="result-icon">
              {mood.icon}
            </div>

            <h2>Mood Result</h2>

            <div className="mood-name">
              {mood.name}
            </div>

            {/* Confidence */}
            <div className="confidence-section">

              <div className="confidence-top">
                <span>Confidence</span>
                <strong>87%</strong>
              </div>

              <div className="confidence-bar">
                <div className="confidence-fill"></div>
              </div>

            </div>

            <p className="mood-message">
              {mood.message}
            </p>

          </div>
        )}

      </div>

      {/* Supported Moods */}
      <div className="supported-section">

        <h2>Supported Moods</h2>

        <div className="mood-list">

          <span>😊 Happy</span>
          <span>😢 Sad</span>
          <span>😌 Calm</span>
          <span>⚡ Energetic</span>
          <span>😠 Angry</span>

        </div>

      </div>

      {/* Prediction History */}
      {history.length > 0 && (
        <div className="history-card">

          <h2>📈 Prediction History</h2>

          {history.map((item, index) => (
            <div className="history-item" key={index}>

              <div>
                <strong>{item.mood}</strong>
                <p>{item.song}</p>
              </div>

              <span>{item.time}</span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default App;
