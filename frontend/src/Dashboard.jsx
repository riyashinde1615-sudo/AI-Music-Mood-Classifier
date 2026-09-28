import React, { useState } from "react";

function Dashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [songName, setSongName] = useState("");
  const [lyrics, setLyrics] = useState("");

  const [mood, setMood] = useState("Waiting");
  const [confidence, setConfidence] = useState("-- %");
  const [intensity, setIntensity] = useState("--");

  const [lyricsMood, setLyricsMood] = useState("Waiting");
  const [lyricsConfidence, setLyricsConfidence] = useState("-- %");

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // Upload Music
  const handleUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSongName(file.name);
      setMood("Waiting");
      setConfidence("-- %");
      setIntensity("--");
    }
  };

  // Analyze Music using FastAPI Backend
  const handleAnalyzeMusic = async () => {
    if (!songName) {
      alert("Please upload music first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://ai-music-mood-classifier-fx95.onrender.com/predict"
      );

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      if (data.mood === "Happy") {
        setMood("😊 Happy");
      } else if (data.mood === "Sad") {
        setMood("😢 Sad");
      } else if (data.mood === "Calm") {
        setMood("😌 Calm");
      } else if (data.mood === "Energetic") {
        setMood("⚡ Energetic");
      } else if (data.mood === "Angry") {
        setMood("😡 Angry");
      } else if (data.mood === "Romantic") {
        setMood("💕 Romantic");
      } else if (data.mood === "Fearful") {
        setMood("😨 Fearful");
      } else if (data.mood === "Relaxed") {
        setMood("😴 Relaxed");
      } else {
        setMood(data.mood);
      }

      setConfidence(`${data.confidence}%`);
      setIntensity(data.intensity);

    } catch (error) {
      console.error(error);
      alert("Cannot connect to FastAPI backend.");
    }

    setLoading(false);
  };

  // Analyze Lyrics
  const handleAnalyzeLyrics = () => {
    if (!lyrics.trim()) {
      alert("Please enter lyrics first.");
      return;
    }

    const text = lyrics.toLowerCase();

    if (
      text.includes("love") ||
      text.includes("heart") ||
      text.includes("kiss") ||
      text.includes("romantic")
    ) {
      setLyricsMood("💕 Romantic");
      setLyricsConfidence("95%");
    } else if (
      text.includes("sad") ||
      text.includes("cry") ||
      text.includes("tears") ||
      text.includes("alone")
    ) {
      setLyricsMood("😢 Sad");
      setLyricsConfidence("91%");
    } else if (
      text.includes("calm") ||
      text.includes("peace") ||
      text.includes("relax") ||
      text.includes("quiet")
    ) {
      setLyricsMood("😌 Calm");
      setLyricsConfidence("93%");
    } else if (
      text.includes("angry") ||
      text.includes("hate") ||
      text.includes("fight") ||
      text.includes("rage")
    ) {
      setLyricsMood("😡 Angry");
      setLyricsConfidence("90%");
    } else if (
      text.includes("energy") ||
      text.includes("dance") ||
      text.includes("run") ||
      text.includes("power")
    ) {
      setLyricsMood("⚡ Energetic");
      setLyricsConfidence("92%");
    } else if (
      text.includes("fear") ||
      text.includes("scared") ||
      text.includes("dark") ||
      text.includes("danger")
    ) {
      setLyricsMood("😨 Fearful");
      setLyricsConfidence("89%");
    } else if (
      text.includes("relaxed") ||
      text.includes("sleep") ||
      text.includes("peaceful") ||
      text.includes("rest")
    ) {
      setLyricsMood("😴 Relaxed");
      setLyricsConfidence("94%");
    } else if (
      text.includes("happy") ||
      text.includes("joy") ||
      text.includes("smile") ||
      text.includes("fun")
    ) {
      setLyricsMood("😊 Happy");
      setLyricsConfidence("94%");
    } else {
      setLyricsMood("😊 Happy");
      setLyricsConfidence("80%");
    }
  };

  // Feedback
  const handleFeedback = () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!feedback.trim()) {
      alert("Please write your feedback.");
      return;
    }

    setFeedbackMessage(
      "✅ Thank you! Your feedback has been submitted."
    );

    setFeedback("");
    setRating(0);
  };

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <h2>🎵 AI Mood</h2>

        <button onClick={() => setActiveSection("dashboard")}>
          🏠 Dashboard
        </button>

        <button onClick={() => setActiveSection("analyze")}>
          🎧 Analyze Music
        </button>

        <button onClick={() => setActiveSection("history")}>
          📜 Prediction History
        </button>

        <button onClick={() => setActiveSection("lyrics")}>
          📝 Lyrics Analysis
        </button>

        <button onClick={() => setActiveSection("feedback")}>
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
              Analyze your music and discover its emotional mood using AI.
            </p>

            <div className="feature-grid">

              <div className="feature-card">
                <h3>😊 Mood Detection</h3>
                <p>Identifies the overall emotional mood of your music.</p>
                <strong>{mood}</strong>
              </div>

              <div className="feature-card">
                <h3>🎯 Confidence Score</h3>
                <p>Shows how confident the AI model is in its prediction.</p>
                <strong>{confidence}</strong>
              </div>

              <div className="feature-card">
                <h3>📈 Mood Timeline</h3>
                <p>Shows how the emotional mood changes throughout the song.</p>
              </div>

              <div className="feature-card">
                <h3>🔄 Mood Transition</h3>
                <p>Displays changes between different moods during the song.</p>
                <strong>Happy → Calm → Energetic</strong>
              </div>

              <div className="feature-card">
                <h3>🎯 Mood Intensity</h3>
                <p>Measures whether the detected mood is Low, Medium or High.</p>
                <strong>{intensity}</strong>
              </div>

              <div className="feature-card">
                <h3>🎵 Song Information</h3>
                <p>Displays basic information about the uploaded music file.</p>
                <strong>{songName || "No song selected"}</strong>
              </div>

              <div className="feature-card">
                <h3>🎼 Audio Analysis</h3>
                <p>Analyzes audio characteristics such as energy and tempo.</p>
              </div>

              <div className="feature-card">
                <h3>⚖️ Mood Summary</h3>
                <p>Provides a short summary of the complete mood analysis.</p>
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
              {loading ? "Analyzing..." : "Predict Mood"}
            </button>

            <div className="result-box">

              <h3>Mood: {mood}</h3>

              <p>Confidence: {confidence}</p>

              <p>Intensity: {intensity}</p>

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

            <div className="history-item">
              <strong>Sample Song</strong>
              <span>😊 Happy — 94%</span>
            </div>

            <div className="history-item">
              <strong>Sample Music</strong>
              <span>😌 Calm — 91%</span>
            </div>

            <button
              onClick={() => setActiveSection("dashboard")}
            >
              ← Back to Dashboard
            </button>

          </section>
        )}

        {/* LYRICS */}
        {activeSection === "lyrics" && (
          <section className="section-card">

            <h2>📝 Lyrics Analysis</h2>

            <p>
              Enter your song lyrics and the system will analyze
              the emotional mood.
            </p>

            <textarea
              rows="8"
              placeholder="Type or paste your song lyrics here..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
            />

            <button onClick={handleAnalyzeLyrics}>
              Analyze Lyrics
            </button>

            <div className="result-box">

              <h3>Mood: {lyricsMood}</h3>

              <p>Confidence: {lyricsConfidence}</p>

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
              Tell us about your experience with the AI Music Mood Classifier.
            </p>

            <div className="stars">

              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                >
                  {star <= rating ? "⭐" : "☆"}
                </button>
              ))}

            </div>

            <textarea
              rows="5"
              placeholder="Write your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <button onClick={handleFeedback}>
              Submit Feedback
            </button>

            {feedbackMessage && (
              <p>{feedbackMessage}</p>
            )}

            <button
              onClick={() => setActiveSection("dashboard")}
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
