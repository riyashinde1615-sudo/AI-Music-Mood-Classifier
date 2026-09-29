import React, { useState } from "react";

function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [songName, setSongName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [lyrics, setLyrics] = useState("");

  const [mood, setMood] = useState("Waiting");
  const [confidence, setConfidence] = useState("-- %");
  const [intensity, setIntensity] = useState("--");

  const [lyricsMood, setLyricsMood] = useState("Waiting");
  const [lyricsConfidence, setLyricsConfidence] = useState("-- %");

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const API_URL =
    "https://ai-music-mood-classifier-2-q0hb.onrender.com";

  // ---------------- USER ----------------

  const userId = user?.id || null;

  // ---------------- MOOD EMOJI ----------------

  const getMoodEmoji = (moodName) => {
    if (moodName === "Happy") return "😊 Happy";
    if (moodName === "Sad") return "😢 Sad";
    if (moodName === "Calm") return "😌 Calm";
    if (moodName === "Energetic") return "⚡ Energetic";
    if (moodName === "Angry") return "😡 Angry";
    if (moodName === "Romantic") return "💕 Romantic";
    if (moodName === "Fearful") return "😨 Fearful";
    if (moodName === "Relaxed") return "😴 Relaxed";

    return moodName;
  };

  // ---------------- MUSIC UPLOAD ----------------

  const handleUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
      setSongName(file.name);

      setMood("Waiting");
      setConfidence("-- %");
      setIntensity("--");
    }
  };

  // ---------------- MUSIC ANALYSIS ----------------

  const handleAnalyzeMusic = async () => {
    if (!selectedFile) {
      alert("Please upload music first.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      if (userId) {
        formData.append("user_id", userId);
      }

      const response = await fetch(
        `${API_URL}/predict`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      setMood(getMoodEmoji(data.mood));
      setConfidence(`${data.confidence}%`);
      setIntensity(data.intensity);

      alert("Music analysis completed!");

    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend.");
    }

    setLoading(false);
  };

  // ---------------- LYRICS ANALYSIS ----------------

  const handleAnalyzeLyrics = async () => {
    if (!lyrics.trim()) {
      alert("Please enter lyrics first.");
      return;
    }

    setLyricsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/predict-lyrics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lyrics: lyrics,
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      setLyricsMood(getMoodEmoji(data.mood));
      setLyricsConfidence(`${data.confidence}%`);

      alert("Lyrics analysis completed!");

    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend.");
    }

    setLyricsLoading(false);
  };

  // ---------------- HISTORY ----------------

  const loadHistory = async () => {
    if (!userId) {
      alert("User information not found.");
      return;
    }

    setHistoryLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/history/${userId}`
      );

      if (!response.ok) {
        throw new Error("History error");
      }

      const data = await response.json();

      setHistory(data.history || []);

    } catch (error) {
      console.error(error);
      alert("Cannot load prediction history.");
    }

    setHistoryLoading(false);
  };

  const openHistory = () => {
    setActiveSection("history");
    loadHistory();
  };

  // ---------------- FEEDBACK ----------------

  const handleFeedback = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!feedback.trim()) {
      alert("Please write your feedback.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            message: feedback,
            rating: rating,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Feedback failed.");
        return;
      }

      setFeedbackMessage(
        "✅ Thank you! Your feedback has been submitted."
      );

      setFeedback("");
      setRating(0);

    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend.");
    }
  };

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <h2>🎵 AI Mood</h2>

        <button
          onClick={() => setActiveSection("dashboard")}
        >
          🏠 Dashboard
        </button>

        <button
          onClick={() => setActiveSection("analyze")}
        >
          🎧 Analyze Music
        </button>

        <button
          onClick={openHistory}
        >
          📜 Prediction History
        </button>

        <button
          onClick={() => setActiveSection("lyrics")}
        >
          📝 Lyrics Analysis
        </button>

        <button
          onClick={() => setActiveSection("feedback")}
        >
          💬 Feedback
        </button>

        <button
          onClick={onLogout}
          className="logout-button"
        >
          🚪 Logout
        </button>

      </aside>


      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* DASHBOARD */}

        {activeSection === "dashboard" && (
          <>
            <h1>AI Music Mood Classifier</h1>

            <p>
              Welcome, {user?.name || "User"} 👋
            </p>

            <p>
              Analyze your music and discover its emotional mood using AI.
            </p>

            <div className="feature-grid">

              <div className="feature-card">
                <h3>😊 Mood Detection</h3>
                <p>
                  Identifies the overall emotional mood of your music.
                </p>
                <strong>{mood}</strong>
              </div>

              <div className="feature-card">
                <h3>🎯 Confidence Score</h3>
                <p>
                  Shows how confident the AI model is in its prediction.
                </p>
                <strong>{confidence}</strong>
              </div>

              <div className="feature-card">
                <h3>📈 Mood Timeline</h3>
                <p>
                  Shows how the emotional mood changes throughout the song.
                </p>
              </div>

              <div className="feature-card">
                <h3>🔄 Mood Transition</h3>
                <p>
                  Displays changes between different moods during the song.
                </p>
                <strong>Happy → Calm → Energetic</strong>
              </div>

              <div className="feature-card">
                <h3>🎯 Mood Intensity</h3>
                <p>
                  Measures whether the detected mood is Low, Medium or High.
                </p>
                <strong>{intensity}</strong>
              </div>

              <div className="feature-card">
                <h3>🎵 Song Information</h3>
                <p>
                  Displays information about the uploaded music file.
                </p>
                <strong>
                  {songName || "No song selected"}
                </strong>
              </div>

              <div className="feature-card">
                <h3>🎼 Audio Analysis</h3>
                <p>
                  Analyzes audio characteristics such as energy and tempo.
                </p>
              </div>

              <div className="feature-card">
                <h3>⚖️ Mood Summary</h3>
                <p>
                  Provides a short summary of the complete mood analysis.
                </p>

                <strong>
                  {mood === "Waiting"
                    ? "Waiting for analysis"
                    : mood}
                </strong>
              </div>

            </div>
          </>
        )}


        {/* ANALYZE MUSIC */}

        {activeSection === "analyze" && (
          <section className="section-card">

            <h2>🎧 Analyze Music</h2>

            <input
              type="file"
              accept="audio/*"
              onChange={handleUpload}
            />

            <p>
              {songName
                ? `Selected: ${songName}`
                : "No music selected"}
            </p>

            <button
              onClick={handleAnalyzeMusic}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Predict Mood"}
            </button>

            <div className="result-box">

              <h3>Mood: {mood}</h3>

              <p>
                Confidence: {confidence}
              </p>

              <p>
                Intensity: {intensity}
              </p>

            </div>

            <button
              onClick={() => setActiveSection("dashboard")}
            >
              ← Back to Dashboard
            </button>

          </section>
        )}


        {/* HISTORY */}

        {activeSection === "history" && (
          <section className="section-card">

            <h2>📜 Prediction History</h2>

            {historyLoading ? (
              <p>Loading history...</p>
            ) : history.length === 0 ? (
              <p>No prediction history found.</p>
            ) : (
              history.map((item) => (
                <div
                  className="history-item"
                  key={item.id}
                >
                  <strong>
                    {item.filename ||
                      "Lyrics Analysis"}
                  </strong>

                  <span>
                    {getMoodEmoji(item.mood)} —{" "}
                    {item.confidence}%
                  </span>

                  <small>
                    Intensity: {item.intensity}
                  </small>
                </div>
              ))
            )}

            <button
              onClick={() => setActiveSection("dashboard")}
            >
              ← Back to Dashboard
            </button>

          </section>
        )}


        {/* LYRICS ANALYSIS */}

        {activeSection === "lyrics" && (
          <section className="section-card">

            <h2>📝 Lyrics Analysis</h2>

            <p>
              Enter your song lyrics and the system will analyze
              the emotional mood using AI.
            </p>

            <textarea
              rows="8"
              placeholder="Type or paste your song lyrics here..."
              value={lyrics}
              onChange={(e) =>
                setLyrics(e.target.value)
              }
            />

            <button
              onClick={handleAnalyzeLyrics}
              disabled={lyricsLoading}
            >
              {lyricsLoading
                ? "Analyzing..."
                : "Analyze Lyrics"}
            </button>

            <div className="result-box">

              <h3>
                Mood: {lyricsMood}
              </h3>

              <p>
                Confidence: {lyricsConfidence}
              </p>

            </div>

            <button
              onClick={() => setActiveSection("dashboard")}
            >
              ← Back to Dashboard
            </button>

          </section>
        )}


        {/* FEEDBACK */}

        {activeSection === "feedback" && (
          <section className="section-card">

            <h2>💬 Feedback</h2>

            <p>
              Tell us about your experience with
              the AI Music Mood Classifier.
            </p>

            <div className="stars">

              {[1, 2, 3, 4, 5].map((star) => (

                <button
                  key={star}
                  onClick={() =>
                    setRating(star)
                  }
                >
                  {star <= rating
                    ? "⭐"
                    : "☆"}
                </button>

              ))}

            </div>

            <textarea
              rows="5"
              placeholder="Write your feedback..."
              value={feedback}
              onChange={(e) =>
                setFeedback(e.target.value)
              }
            />

            <button
              onClick={handleFeedback}
            >
              Submit Feedback
            </button>

            {feedbackMessage && (
              <p>{feedbackMessage}</p>
            )}

            <button
              onClick={() =>
                setActiveSection("dashboard")
              }
            >
              ← Back to Dashboard
            </button>

          </section>
        )}

      </main>

    </div>
  );
}

export default Dashboard;
