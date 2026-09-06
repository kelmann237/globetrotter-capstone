import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from jose import jwt
from .security import SECRET_KEY, ALGORITHM
from .models import UserCreate, UserLogin


router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



DATA_FILE = Path(__file__).parent.parent / "data" / "data.json"


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


@router.post("/register")
def register(user: UserCreate):
    data = load_data()

    for existing_user in data["users"]:
        if existing_user["email"] == user.email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

    new_user = {
    "id": len(data["users"]) + 1,
    "name": user.name,
    "email": user.email,
    "password": pwd_context.hash(user.password),
    "preferences": user.preferences,
    "budget": user.budget
}

    data["users"].append(new_user)
    save_data(data)

    return {
        "message": "User registered successfully",
        "user_id": new_user["id"]
    }


@router.post("/login")
def login(user: UserLogin):
    data = load_data()

    for existing_user in data["users"]:
        if existing_user["email"] == user.email:
            if not pwd_context.verify(
                user.password,
                existing_user["password"]
            ):
                raise HTTPException(
                    status_code=401,
                    detail="Invalid credentials"
                )

            token = jwt.encode(
                {
                    "sub": str(existing_user["id"]),
                    "email": existing_user["email"]
                },
                SECRET_KEY,
                algorithm=ALGORITHM
            )

            return {
                "access_token": token,
                "token_type": "bearer"
            }

    raise HTTPException(
        status_code=401,
        detail="Invalid credentials"
    )