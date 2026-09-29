const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const FASTAPI_URL =
  "https://ai-music-mood-classifier-1-yz2u.onrender.com";

app.get("/", (req, res) => {
  res.json({
    message: "Node.js Backend is running!"
  });
});

app.post("/predict-lyrics", async (req, res) => {
  try {
    const response = await fetch(
      `${FASTAPI_URL}/predict-lyrics`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Cannot connect to FastAPI backend"
    });
  }
});

app.listen(3000, () => {
  console.log("Node.js server running on port 3000");
});
