from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    return {
        "message": "AI Music Mood Classifier API is running!"
    }


@app.get("/moods")
def get_moods():
    return {
        "moods": [
            "Happy",
            "Sad",
            "Calm",
            "Energetic",
            "Angry",
            "Romantic",
            "Fearful",
            "Relaxed"
        ]
    }


@app.post("/predict")
async def predict_music(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "mood": "Happy",
        "confidence": 94,
        "intensity": "High"
    }


@app.post("/predict-lyrics")
async def predict_lyrics(data: dict):

    lyrics = data.get("lyrics", "").lower()

    if not lyrics:
        return {
            "mood": "Unknown",
            "confidence": 0
        }

    if "love" in lyrics or "heart" in lyrics or "kiss" in lyrics:
        mood = "Romantic"
        confidence = 95

    elif "sad" in lyrics or "cry" in lyrics or "tears" in lyrics:
        mood = "Sad"
        confidence = 91

    elif "calm" in lyrics or "peace" in lyrics or "quiet" in lyrics:
        mood = "Calm"
        confidence = 93

    elif "angry" in lyrics or "hate" in lyrics or "fight" in lyrics:
        mood = "Angry"
        confidence = 90

    elif "dance" in lyrics or "energy" in lyrics or "power" in lyrics:
        mood = "Energetic"
        confidence = 92

    elif "fear" in lyrics or "scared" in lyrics or "danger" in lyrics:
        mood = "Fearful"
        confidence = 89

    elif "relaxed" in lyrics or "sleep" in lyrics or "rest" in lyrics:
        mood = "Relaxed"
        confidence = 94

    elif "happy" in lyrics or "joy" in lyrics or "smile" in lyrics:
        mood = "Happy"
        confidence = 94

    else:
        mood = "Happy"
        confidence = 80

    return {
        "mood": mood,
        "confidence": confidence,
        "intensity": "Medium"
    }
