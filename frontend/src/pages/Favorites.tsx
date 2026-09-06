import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFavorites,
  getDestinations,
  removeFavorite,
} from "../services/api";

interface Destination {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  budget: string;
  rating: number;
  image: string | null;
}

interface Favorite {
  id: number;
  user_id: number;
  destination_id: number;
}

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const [favoriteData, destinationData] = await Promise.all([
          getFavorites(),
          getDestinations(),
        ]);

        setFavorites(favoriteData);
        setDestinations(destinationData);
      } catch (error) {
        console.error("Unable to load favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (destinationId: number) => {
    try {
      await removeFavorite(destinationId);

      setFavorites((current) =>
        current.filter(
          (favorite) => favorite.destination_id !== destinationId
        )
      );
    } catch (error) {
      console.error("Unable to remove favorite:", error);
    }
  };

  const favoriteDestinations = favorites
    .map((favorite) =>
      destinations.find(
        (destination) =>
          destination.id === favorite.destination_id
      )
    )
    .filter(
      (destination): destination is Destination =>
        destination !== undefined
    );

  return (
    <main className="favorites-page">
      <section className="favorites-header">
        <p className="eyebrow">YOUR SAVED PLACES</p>

        <h1>Your favorites.</h1>

        <p>
          Keep your favorite experiences in Yaoundé in one place.
        </p>
      </section>

      {loading ? (
        <p className="loading-message">
          Loading your favorites...
        </p>
      ) : favoriteDestinations.length === 0 ? (
        <section className="empty-favorites">
          <div className="empty-favorites-icon">♡</div>

          <h2>No favorites yet</h2>

          <p>
            Explore Yaoundé and save the places you would like
            to visit.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/destinations")}
          >
            Explore Destinations →
          </button>
        </section>
      ) : (
        <section className="favorites-grid">
          {favoriteDestinations.map((destination) => (
            <div
              key={destination.id}
              className="favorite-item"
            >
              <div className="favorite-card">
                <div className="favorite-image">
                  {destination.image && (
                    <img
                      src={destination.image}
                      alt={destination.name}
                    />
                  )}

                  <span>{destination.category}</span>
                </div>

                <div className="favorite-content">
                  <h3>{destination.name}</h3>

                  <p>{destination.location}</p>

                  <div className="favorite-footer">
                    <span>★ {destination.rating}</span>

                    <span>
                      {destination.budget} budget
                    </span>
                  </div>

                  <button
                    className="remove-favorite-btn"
                    onClick={() =>
                      handleRemoveFavorite(destination.id)
                    }
                  >
                    ♥ Remove from favorites
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

export default Favorites;