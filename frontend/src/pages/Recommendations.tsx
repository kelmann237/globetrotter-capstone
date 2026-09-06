import { useEffect, useState } from "react";
import { getRecommendations } from "../services/api";
import DestinationCard from "../components/DestinationCard";

interface Destination {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  budget: string;
  rating: number;
  image: string | null;
  score: number;
}

function Recommendations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const data = await getRecommendations();
        setDestinations(data.recommendations);
      } catch (error) {
        console.error(error);
        setError("Unable to load recommendations.");
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const filteredDestinations = destinations.filter((destination) => {
    const matchesCategory =
      category === "" ||
      destination.category.toLowerCase() === category.toLowerCase();

    const matchesBudget =
      budget === "" ||
      destination.budget.toLowerCase() === budget.toLowerCase();

    return matchesCategory && matchesBudget;
  });

  return (
    <main className="recommendations-page">
      <section className="recommendations-header">
        <p className="eyebrow">PERSONALIZED FOR YOU</p>

        <h1>Recommended experiences.</h1>

        <p>
          Discover places in Yaoundé selected according to your
          interests and budget.
        </p>
      </section>

      <section className="recommendation-filters">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          <option value="Culture">Culture</option>
          <option value="Nature">Nature</option>
          <option value="Landmark">Landmark</option>
        </select>

        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        >
          <option value="">All budgets</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </section>

      {loading && (
        <p className="loading-message">
          Finding the best experiences for you...
        </p>
      )}

      {error && (
        <p className="auth-error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <section className="recommendations-grid">
          {filteredDestinations.length > 0 ? (
            filteredDestinations.map((destination) => (
              <div
                key={destination.id}
                className="recommendation-item"
              >
                <DestinationCard destination={destination} />

                <div className="recommendation-score">
                  ⭐ {destination.score} match
                </div>
              </div>
            ))
          ) : (
            <div className="empty-recommendations">
              <h3>No recommendations found</h3>
              <p>
                Try changing your category or budget filters.
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default Recommendations;