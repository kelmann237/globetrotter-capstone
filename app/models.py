from pydantic import BaseModel, EmailStr
from typing import List, Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    preferences: List[str] = []
    budget: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    id: int
    name: str
    email: EmailStr
    preferences: List[str] = []


class Destination(BaseModel):
    id: int
    name: str
    category: str
    description: str
    location: str
    budget: str
    rating: float
    image: Optional[str] = None


class ItineraryCreate(BaseModel):
    title: str
    destination_ids: List[int]
    start_date: str
    end_date: str


class Itinerary(BaseModel):
    id: int
    user_id: int
    title: str
    destination_ids: List[int]
    start_date: str
    end_date: str