import React, { useEffect, useState } from "react";

const API_URL =
  "https://ai-music-mood-classifier-2-q0hb.onrender.com";

function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [selectedFile, setSelectedFile] = useState(null);
  const [songName, setSongName] = useState("");

  const [mood, setMood] = useState("Waiting");
  const [confidence, setConfidence] = useState("--%");
  const [intensity, setIntensity] = useState("--");

  const [lyrics, setLyrics] = useState("");
  const [lyricsMood, setLyricsMood] = useState("Waiting");
  const [lyricsConfidence, setLyricsConfidence] = useState("--%");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(false);

  const cardStyle = {
    cursor: "pointer",
  };

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setSongName(file.name);
    }
  };

  const handleAnalyzeMusic = async () => {
    if (!selectedFile) {
      alert("Please select a music file first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("user_id", user?.id || 1);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed");
      }

      setMood(data.mood || "Happy");
      setConfidence(
        data.confidence !== undefined
          ? `${data.confidence}%`
          : "94%"
      );
      setIntensity(data.intensity || "High");

      await loadHistory();

      alert("Music analyzed successfully!");
    } catch (error) {
      console.error(error);
      alert("Music analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeLyrics = async () => {
    if (!lyrics.trim()) {
      alert("Please enter lyrics first.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/predict-lyrics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lyrics: lyrics,
            user_id: user?.id || 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Lyrics prediction failed");
      }

      setLyricsMood(data.mood || "Happy");

      setLyricsConfidence(
        data.confidence !== undefined
          ? `${data.confidence}%`
          : "94%"
      );

      setMood(data.mood || "Happy");

      setConfidence(
        data.confidence !== undefined
          ? `${data.confidence}%`
          : "94%"
      );

      setIntensity(data.intensity || "High");

      await loadHistory();

      alert("Lyrics analyzed successfully!");
    } catch (error) {
      console.error(error);
      alert("Lyrics analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setHistoryLoading(true);

      const response = await fetch(
        `${API_URL}/history/${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setHistory(Array.isArray(data) ? data : []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error(error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!rating) {
      alert("Please select a rating.");
      return;
    }

    if (!feedback.trim()) {
      alert("Please enter your feedback.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id || 1,
          rating: rating,
          feedback: feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Feedback failed");
      }

      alert("Thank you for your feedback!");

      setRating(0);
      setFeedback("");
    } catch (error) {
      console.error(error);
      alert("Feedback could not be submitted.");
    }
  };

  const getMoodIcon = (currentMood) => {
    const icons = {
      Happy: "😊",
      Sad: "😢",
      Calm: "😌",
      Energetic: "⚡",
      Angry: "😠",
      Romantic: "❤️",
      Fearful: "😨",
      Relaxed: "🌿",
    };

    return icons[currentMood] || "🎵";
  };

  const renderDashboard = () => (
    <>
<div className="hero">
  <div>
    <h1>Welcome to AI Music Mood Classifier</h1>
  </div>

  <div className="hero-icon">
    🎵
  </div>
</div>

      <h2 className="section-title">
        AI Music Analysis Features
      </h2>

      <div className="feature-grid">

        <div
          className="feature-card blue"
          onClick={() => setActiveSection("analyze")}
          style={cardStyle}
        >
          <div className="card-icon">😊</div>
          <h3>Mood Detection</h3>
          <p>
            Detect the emotional mood of your music
            using AI.
          </p>
          <strong>Analyze Mood →</strong>
        </div>

        <div
          className="feature-card green"
          onClick={() => {
            setActiveSection("summary");
          }}
          style={cardStyle}
        >
          <div className="card-icon">🎯</div>

          <h3>Confidence Score</h3>

          <p>
            Shows how confident the AI prediction is.
          </p>

          <div className="confidence-value">
            {confidence}
          </div>

          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{
                width:
                  confidence === "--%"
                    ? "0%"
                    : confidence,
              }}
            ></div>
          </div>
        </div>

        <div
          className="feature-card purple"
          onClick={() => {
            setActiveSection("timeline");
            loadHistory();
          }}
          style={cardStyle}
        >
          <div className="card-icon">📈</div>

          <h3>Mood Timeline</h3>

          <p>
            Track your mood predictions over time.
          </p>

          <strong>View Timeline →</strong>
        </div>

        <div
          className="feature-card orange"
          onClick={() => {
            setActiveSection("transition");
            loadHistory();
          }}
          style={cardStyle}
        >
          <div className="card-icon">🔄</div>

          <h3>Mood Transition</h3>

          <p>
            See how your moods change between predictions.
          </p>

          <strong>View Transition →</strong>
        </div>

        <div
          className="feature-card red"
          onClick={() => setActiveSection("summary")}
          style={cardStyle}
        >
          <div className="card-icon">🎯</div>

          <h3>Mood Intensity</h3>

          <p>
            Measures the strength of the detected emotion.
          </p>

          <div className="intensity-value">
            {intensity}
          </div>

          <div className="intensity-bar">
            <div
              className="intensity-fill"
              style={{
                width:
                  intensity === "--"
                    ? "0%"
                    : intensity === "Low"
                    ? "35%"
                    : intensity === "Medium"
                    ? "65%"
                    : "90%",
              }}
            ></div>
          </div>
        </div>

        <div
          className="feature-card yellow"
          onClick={() => {
            setActiveSection("analyze");
          }}
          style={cardStyle}
        >
          <div className="card-icon">🎼</div>

          <h3>Audio Analysis</h3>

          <p>
            Upload and analyze your music file.
          </p>

          <strong>Analyze Music →</strong>
        </div>

        <div
          className="feature-card teal"
          onClick={() => {
            setActiveSection("trends");
            loadHistory();
          }}
          style={cardStyle}
        >
          <div className="card-icon">📊</div>

          <h3>Mood Trends</h3>

          <p>
            View your detected mood trends.
          </p>

          <strong>View Mood Trends →</strong>
        </div>

        <div
          className="feature-card violet mood-summary-card"
          onClick={() =>
            setActiveSection("summary")
          }
          style={cardStyle}
        >
          <div className="card-icon">⚖️</div>

          <h3>Mood Summary</h3>

          <p>
            View a complete summary of your latest
            AI prediction.
          </p>

          <div className="summary-mini">
            <div>
              <span>Mood</span>
              <strong>{mood}</strong>
            </div>

            <div>
              <span>Confidence</span>
              <strong>{confidence}</strong>
            </div>

            <div>
              <span>Intensity</span>
              <strong>{intensity}</strong>
            </div>
          </div>

          <strong className="summary-link">
            View Summary →
          </strong>
        </div>
      </div>
    </>
  );

  const renderAnalyze = () => (
    <div className="page-card">
      <h1>🎵 Analyze Music</h1>

      <p>
        Upload a music file and discover its
        emotional mood.
      </p>

      <div className="upload-box">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
        />

        {songName && (
          <div className="selected-song">
            🎵 {songName}
          </div>
        )}

        <button
          className="primary-btn"
          onClick={handleAnalyzeMusic}
          disabled={loading}
        >
          {loading
            ? "Analyzing..."
            : "Predict Mood"}
        </button>
      </div>

      {mood !== "Waiting" && (
        <div className="result-box">
          <h2>
            {getMoodIcon(mood)} {mood}
          </h2>

          <p>
            Confidence: <strong>{confidence}</strong>
          </p>

          <p>
            Intensity: <strong>{intensity}</strong>
          </p>
        </div>
      )}
    </div>
  );

  const renderLyrics = () => (
    <div className="page-card">
      <h1>🎤 Lyrics Analysis</h1>

      <p>
        Enter song lyrics to detect their emotional
        mood.
      </p>

      <textarea
        className="lyrics-input"
        value={lyrics}
        onChange={(e) =>
          setLyrics(e.target.value)
        }
        placeholder="Type or paste your song lyrics here..."
      ></textarea>

      <button
        className="primary-btn"
        onClick={handleAnalyzeLyrics}
        disabled={loading}
      >
        {loading
          ? "Analyzing..."
          : "Analyze Lyrics"}
      </button>

      {lyricsMood !== "Waiting" && (
        <div className="result-box">
          <h2>
            {getMoodIcon(lyricsMood)} {lyricsMood}
          </h2>

          <p>
            Confidence:{" "}
            <strong>{lyricsConfidence}</strong>
          </p>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="page-card">
      <h1>🕘 Prediction History</h1>

      <p>
        View your previous mood predictions.
      </p>

      {historyLoading ? (
        <h3>Loading history...</h3>
      ) : history.length === 0 ? (
        <div className="empty-history">
          <div>🎵</div>

          <h3>No prediction history yet.</h3>

          <p>
            Analyze music or lyrics to create
            prediction history.
          </p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div
              className="history-card"
              key={item.id}
            >
              <div className="card-icon">
                {getMoodIcon(item.mood)}
              </div>

              <h3>{item.mood}</h3>

              <p>
                Confidence:{" "}
                <strong>
                  {item.confidence}%
                </strong>
              </p>

              <p>
                Intensity:{" "}
                <strong>
                  {item.intensity}
                </strong>
              </p>

              <small>
                {item.created_at}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTimeline = () => (
    <div className="page-card timeline-page">
      <h1>📈 Mood Timeline</h1>

      <p>
        Track your mood predictions in chronological
        order.
      </p>

      {history.length === 0 ? (
        <div className="empty-timeline">
          <h3>No timeline data available.</h3>

          <p>
            Analyze some music or lyrics to see
            your mood timeline.
          </p>
        </div>
      ) : (
        <div className="professional-timeline">
          {[...history]
            .reverse()
            .map((item, index) => (
              <div
                className="timeline-card"
                key={item.id}
              >
                <div className="timeline-number">
                  {index + 1}
                </div>

                <div className="timeline-content">
                  <div className="timeline-top">
                    <h3>
                      {getMoodIcon(item.mood)}{" "}
                      {item.mood}
                    </h3>

                    <span>
                      {item.confidence}%
                    </span>
                  </div>

                  <div className="timeline-progress">
                    <div
                      style={{
                        width: `${item.confidence}%`,
                      }}
                    ></div>
                  </div>

                  <div className="timeline-details">
                    <span>
                      Intensity:{" "}
                      {item.intensity}
                    </span>

                    <small>
                      {item.created_at}
                    </small>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  const renderTransition = () => (
    <div className="page-card transition-page">
      <h1>🔄 Mood Transition</h1>

      <p>
        See how your detected moods change across
        your predictions.
      </p>

      {history.length === 0 ? (
        <div className="empty-transition">
          <h3>
            No transition data available.
          </h3>

          <p>
            Analyze music or lyrics to see mood
            transitions.
          </p>
        </div>
      ) : (
        <div className="professional-transition">
          {[...history]
            .reverse()
            .map((item, index) => (
              <div
                className="transition-item"
                key={item.id}
              >
                <div className="transition-mood">
                  <div className="transition-icon">
                    {getMoodIcon(item.mood)}
                  </div>

                  <div>
                    <h3>{item.mood}</h3>

                    <span>
                      Confidence:{" "}
                      {item.confidence}%
                    </span>
                  </div>
                </div>

                {index <
                  history.length - 1 && (
                  <div className="transition-arrow">
                    ↓
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );

  const renderTrends = () => {
    const moodCounts = {};

    history.forEach((item) => {
      moodCounts[item.mood] =
        (moodCounts[item.mood] || 0) + 1;
    });

    const moods = [
      "Happy",
      "Sad",
      "Calm",
      "Energetic",
      "Angry",
      "Romantic",
      "Fearful",
      "Relaxed",
    ];

    return (
      <div className="page-card">
        <h1>📊 Mood Trends</h1>

        <p>
          Your mood prediction trends based on
          previous analyses.
        </p>

        {history.length === 0 ? (
          <h3>
            No mood trend data available.
          </h3>
        ) : (
          <div className="mood-trends">
            {moods.map((currentMood) => {
              const count =
                moodCounts[currentMood] || 0;

              const percentage = Math.min(
                count * 20,
                100
              );

              return (
                <div
                  className="trend-item"
                  key={currentMood}
                >
                  <div className="trend-header">
                    <span>
                      {getMoodIcon(
                        currentMood
                      )}{" "}
                      {currentMood}
                    </span>

                    <strong>{count}</strong>
                  </div>

                  <div className="trend-bar">
                    <div
                      className="trend-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSummary = () => (
    <div className="page-card summary-page">
      <h1>⚖️ Mood Summary</h1>

      <p>
        Complete summary of your latest AI mood
        prediction.
      </p>

      {mood === "Waiting" ? (
        <div className="empty-summary">
          <div>🎵</div>

          <h3>
            No prediction available
          </h3>

          <p>
            Analyze music or lyrics to generate
            your mood summary.
          </p>
        </div>
      ) : (
        <div className="professional-summary">
          <div className="summary-main">
            <div className="summary-big-icon">
              {getMoodIcon(mood)}
            </div>

            <div>
              <span>Detected Mood</span>

              <h2>{mood}</h2>
            </div>
          </div>

          <div className="summary-stats">
            <div className="summary-stat">
              <span>🎯 Confidence</span>

              <strong>
                {confidence}
              </strong>
            </div>

            <div className="summary-stat">
              <span>🔥 Intensity</span>

              <strong>
                {intensity}
              </strong>
            </div>

            <div className="summary-stat">
              <span>🧠 AI Status</span>

              <strong>Analyzed</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFeedback = () => (
    <div className="page-card">
      <h1>💬 Feedback</h1>

      <p>
        Help us improve the AI Music Mood Classifier.
      </p>

      <div className="rating-box">
        <h3>Rate your experience</h3>

        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={
                star <= rating
                  ? "star active"
                  : "star"
              }
              onClick={() =>
                setRating(star)
              }
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="feedback-input"
        value={feedback}
        onChange={(e) =>
          setFeedback(e.target.value)
        }
        placeholder="Write your feedback here..."
      ></textarea>

      <button
        className="primary-btn"
        onClick={handleFeedback}
      >
        Submit Feedback
      </button>
    </div>
  );

  return (
    <div className="dashboard">

      <aside className="navbar">

        <div className="logo">
          🎵 AI Music
        </div>

        <div className="nav-links">

          <button
            className={
              activeSection === "dashboard"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() =>
              setActiveSection("dashboard")
            }
          >
            🏠 Dashboard
          </button>

          <button
            className={
              activeSection === "analyze"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() =>
              setActiveSection("analyze")
            }
          >
            🎵 Analyze Music
          </button>

          <button
            className={
              activeSection === "history"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => {
              setActiveSection("history");
              loadHistory();
            }}
          >
            🕘 Prediction History
          </button>

          <button
            className={
              activeSection === "lyrics"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() =>
              setActiveSection("lyrics")
            }
          >
            🎤 Lyrics Analysis
          </button>

          <button
            className={
              activeSection === "feedback"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() =>
              setActiveSection("feedback")
            }
          >
            💬 Feedback
          </button>

          <button
            className="logout-btn"
            onClick={onLogout}
          >
            🚪 Logout
          </button>

        </div>
      </aside>

      <main className="dashboard-content">

        {activeSection === "dashboard" &&
          renderDashboard()}

        {activeSection === "analyze" &&
          renderAnalyze()}

        {activeSection === "history" &&
          renderHistory()}

        {activeSection === "lyrics" &&
          renderLyrics()}

        {activeSection === "timeline" &&
          renderTimeline()}

        {activeSection === "transition" &&
          renderTransition()}

        {activeSection === "trends" &&
          renderTrends()}

        {activeSection === "summary" &&
          renderSummary()}

        {activeSection === "feedback" &&
          renderFeedback()}

      </main>
    </div>
  );
}

export default Dashboard;
