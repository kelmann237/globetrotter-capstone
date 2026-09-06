import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends

from .models import ItineraryCreate
from .security import get_current_user


router = APIRouter(
    prefix="/itineraries",
    tags=["Itineraries"]
)

DATA_FILE = Path(__file__).parent.parent / "data" / "data.json"


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


@router.post("/")
def create_itinerary(
    itinerary: ItineraryCreate,
    current_user: dict = Depends(get_current_user)
):
    data = load_data()

    for destination_id in itinerary.destination_ids:
        exists = any(
            d["id"] == destination_id
            for d in data["destinations"]
        )

        if not exists:
            raise HTTPException(
                status_code=404,
                detail=f"Destination {destination_id} not found"
            )

    new_itinerary = {
        "id": len(data["itineraries"]) + 1,
        "user_id": current_user["id"],
        "title": itinerary.title,
        "destination_ids": itinerary.destination_ids,
        "start_date": itinerary.start_date,
        "end_date": itinerary.end_date
    }

    data["itineraries"].append(new_itinerary)
    save_data(data)

    return new_itinerary


@router.get("/")
def get_itineraries(
    current_user: dict = Depends(get_current_user)
):
    data = load_data()

    itineraries = [
        itinerary
        for itinerary in data["itineraries"]
        if itinerary["user_id"] == current_user["id"]
    ]

    return itineraries