from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_get_destinations():
    response = client.get("/destinations/")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) > 0


def test_get_destination():
    response = client.get("/destinations/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert "name" in data
    assert "latitude" in data
    assert "longitude" in data


def test_recommendations_requires_authentication():
    response = client.get("/recommendations/")

    assert response.status_code == 401


def test_itineraries_requires_authentication():
    response = client.get("/itineraries/")

    assert response.status_code == 401


def test_favorites_requires_authentication():
    response = client.get("/favorites/")

    assert response.status_code == 401