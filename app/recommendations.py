import json
from pathlib import Path

from fastapi import APIRouter, Depends

from .security import get_current_user


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)

DATA_FILE = Path(__file__).parent.parent / "data" / "data.json"


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


@router.get("/")
def get_recommendations(
    current_user: dict = Depends(get_current_user)
):
    data = load_data()

    destinations = data["destinations"]

    user_preferences = [
        preference.lower()
        for preference in current_user.get("preferences", [])
    ]

    user_budget = current_user.get("budget")

    recommendations = []

    for destination in destinations:
        score = 0

        # Préférence de catégorie
        if destination["category"].lower() in user_preferences:
            score += 50

        # Budget préféré
        if user_budget and destination["budget"].lower() == user_budget.lower():
            score += 30

        # Note de la destination
        score += destination["rating"] * 4

        recommendations.append({
            **destination,
            "score": round(score, 1)
        })

    recommendations.sort(
        key=lambda destination: destination["score"],
        reverse=True
    )

    return {
        "location": "Yaoundé",
        "user": {
            "id": current_user["id"],
            "name": current_user["name"]
        },
        "recommendations": recommendations
    }