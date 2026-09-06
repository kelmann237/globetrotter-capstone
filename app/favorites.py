import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException

from .security import get_current_user


router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)

DATA_FILE = Path(__file__).parent.parent / "data" / "data.json"


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)


@router.get("/")
def get_favorites(current_user: dict = Depends(get_current_user)):
    data = load_data()

    favorites = [
        favorite
        for favorite in data["favorites"]
        if favorite["user_id"] == current_user["id"]
    ]

    return favorites


@router.post("/{destination_id}")
def add_favorite(
    destination_id: int,
    current_user: dict = Depends(get_current_user)
):
    data = load_data()

    destination = next(
        (
            destination
            for destination in data["destinations"]
            if destination["id"] == destination_id
        ),
        None
    )

    if destination is None:
        raise HTTPException(
            status_code=404,
            detail="Destination not found"
        )

    already_favorite = any(
        favorite["user_id"] == current_user["id"]
        and favorite["destination_id"] == destination_id
        for favorite in data["favorites"]
    )

    if already_favorite:
        raise HTTPException(
            status_code=400,
            detail="Destination already saved"
        )

    new_favorite = {
        "id": len(data["favorites"]) + 1,
        "user_id": current_user["id"],
        "destination_id": destination_id
    }

    data["favorites"].append(new_favorite)
    save_data(data)

    return new_favorite


@router.delete("/{destination_id}")
def remove_favorite(
    destination_id: int,
    current_user: dict = Depends(get_current_user)
):
    data = load_data()

    favorite = next(
        (
            favorite
            for favorite in data["favorites"]
            if favorite["user_id"] == current_user["id"]
            and favorite["destination_id"] == destination_id
        ),
        None
    )

    if favorite is None:
        raise HTTPException(
            status_code=404,
            detail="Favorite not found"
        )

    data["favorites"].remove(favorite)
    save_data(data)

    return {
        "message": "Favorite removed successfully"
    }