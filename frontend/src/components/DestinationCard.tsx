import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFavorite, removeFavorite } from "../services/api";

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

interface DestinationCardProps {
  destination: Destination;
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
}

function DestinationCard({
  destination,
  isFavorite = false,
  onFavoriteChange,
}: DestinationCardProps) {
  const navigate = useNavigate();

  const [favorite, setFavorite] = useState(isFavorite);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const handleFavorite = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoadingFavorite(true);

      if (favorite) {
        await removeFavorite(destination.id);
        setFavorite(false);
      } else {
        await addFavorite(destination.id);
        setFavorite(true);
      }

      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error("Favorite error:", error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  return (
    <div className="destination-card">
      <div className="card-image">
        {destination.image && (
          <img src={destination.image} alt={destination.name} />
        )}

        <span>{destination.category}</span>

        <button
          className={
            favorite
              ? "favorite-btn favorite-active"
              : "favorite-btn"
          }
          onClick={handleFavorite}
          disabled={loadingFavorite}
          aria-label={
            favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="card-content">
        <h3>{destination.name}</h3>

        <p>{destination.location}</p>

        <div className="card-footer">
          <span>★ {destination.rating}</span>
          <span>{destination.budget} budget</span>
        </div>
      </div>
    </div>
  );
}

export default DestinationCard;