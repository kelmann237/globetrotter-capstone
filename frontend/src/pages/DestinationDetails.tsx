import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDestination } from "../services/api";
import MapView from "../components/MapView";

interface Destination {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  budget: string;
  rating: number;
  image: string | null;
}

function DestinationDetails() {
  const { id } = useParams();

  const [destination, setDestination] =
    useState<Destination | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDestination = async () => {
      try {
        if (!id) return;

        const data = await getDestination(Number(id));
        setDestination(data);
      } catch (error) {
        console.error(error);
        setError("Destination not found.");
      } finally {
        setLoading(false);
      }
    };

    loadDestination();
  }, [id]);

  if (loading) {
    return (
      <main className="section">
        <p>Loading destination...</p>
      </main>
    );
  }

  if (error || !destination) {
    return (
      <main className="section">
        <h1>Destination not found</h1>

        <Link to="/destinations">
          ← Back to destinations
        </Link>
      </main>
    );
  }

  return (
    <main className="destination-details-page">

      <Link
        to="/destinations"
        className="back-link"
      >
        ← Back to destinations
      </Link>

      <section className="destination-details">

        <div className="destination-details-image">

          {destination.image ? (
            <img
              src={destination.image}
              alt={destination.name}
            />
          ) : (
            <div className="image-placeholder">
              {destination.category}
            </div>
          )}

        </div>

        <div className="destination-details-content">

          <span className="category-badge">
            {destination.category}
          </span>

          <h1>{destination.name}</h1>

          <div className="destination-meta">

            <span>
              ★ {destination.rating}
            </span>

            <span>
              📍 {destination.location}
            </span>

            <span>
              💰 {destination.budget} budget
            </span>

          </div>

          <p className="destination-description">
            {destination.description}
          </p>

          <div className="destination-actions">

            <button className="primary-btn">
              + Add to My Trip
            </button>

            <button className="secondary-btn">
              ♡ Save
            </button>

          </div>

        </div>

      </section>

      {/* LOCATION */}

      <section className="destination-location">

        <div className="location-header">

          <p className="eyebrow">
            LOCATION
          </p>

          <h2>
            Find this place in Yaoundé.
          </h2>

          <p>
            Explore the exact location of{" "}
            <strong>{destination.name}</strong>{" "}
            on the map.
          </p>

        </div>

        <MapView
          latitude={destination.latitude}
          longitude={destination.longitude}
          name={destination.name}
        />

      </section>

    </main>
  );
}

export default DestinationDetails;