import { useEffect, useState } from "react";
import { getDestinations } from "../services/api";

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

function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const data = await getDestinations();
        setDestinations(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load destinations.");
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">DISCOVER YAOUNDÉ</p>

          <h1>
            Explore Yaoundé.
            <br />
            <span>Your journey starts here.</span>
          </h1>

          <p className="hero-text">
            Discover the best places, experiences and hidden gems in
            Cameroon's capital. Build your perfect itinerary and enjoy
            Yaoundé your way.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              Explore Destinations →
            </button>

            <button className="secondary-btn">
              Plan My Trip
            </button>
          </div>
        </div>
      </section>

      <section id="destinations" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXPLORE</p>
            <h2>Popular destinations</h2>
          </div>

          <button className="view-all">View all →</button>
        </div>

        {loading && <p>Loading destinations...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className="destination-grid">
            {destinations.slice(0, 3).map((destination) => (
              <div className="destination-card" key={destination.id}>
                <div className="card-image">
                  {destination.image && (
                    <img
                      src={destination.image}
                      alt={destination.name}
                    />
                  )}

                  <span>{destination.category}</span>
                </div>

                <div className="card-content">
                  <h3>{destination.name}</h3>

                  <p>{destination.location}</p>

                  <div className="card-footer">
                    <span>★ {destination.rating}</span>

                    <span>
                      {destination.budget} budget
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="recommendations" className="recommendation-section">
        <div>
          <p className="eyebrow">PERSONALIZED FOR YOU</p>

          <h2>Not sure where to go?</h2>

          <p>
            GlobeTrotter can recommend places based on your interests,
            budget and travel preferences.
          </p>

          <button className="primary-btn">
            Get Recommendations →
          </button>
        </div>
      </section>
    </>
  );
}

export default Home;