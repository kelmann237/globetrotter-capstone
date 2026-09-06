import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/destinations", tags=["Destinations"])

DATA_FILE = Path(__file__).parent.parent / "data" / "data.json"


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


@router.get("/")
def get_destinations(
    category: str | None = None,
    budget: str | None = None
):
    data = load_data()

    destinations = data["destinations"]

    if category:
        destinations = [
            d for d in destinations
            if d["category"].lower() == category.lower()
        ]

    if budget:
        destinations = [
            d for d in destinations
            if d["budget"].lower() == budget.lower()
        ]

    return destinations


@router.get("/{destination_id}")
def get_destination(destination_id: int):
    data = load_data()

    for destination in data["destinations"]:
        if destination["id"] == destination_id:
            return destination

    raise HTTPException(
        status_code=404,
        detail="Destination not found"
    )