import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import router as auth_router
from .destinations import router as destinations_router
from .itineraries import router as itineraries_router
from .recommendations import router as recommendations_router
from .favorites import router as favorites_router


app = FastAPI(
    title="GlobeTrotter Yaoundé API",
    description="Travel assistant for discovering and planning trips in Yaoundé, Cameroon.",
    version="1.0.0"
)


frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5174")

allowed_origins = [
    "http://localhost:5174",
    frontend_url,
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(allowed_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(destinations_router)
app.include_router(itineraries_router)
app.include_router(recommendations_router)
app.include_router(favorites_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to GlobeTrotter Yaoundé API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }