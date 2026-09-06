import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDestinations } from "../services/api";
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
}

function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const data = await getDestinations();
        setDestinations(data);
      } catch (error) {
        console.error("Error loading destinations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.name.toLowerCase().includes(search.toLowerCase()) ||
      destination.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "" ||
      destination.category.toLowerCase() === category.toLowerCase();

    const matchesBudget =
      budget === "" ||
      destination.budget.toLowerCase() === budget.toLowerCase();

    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <main className="destinations-page">
      <section className="destinations-header">
        <p className="eyebrow">DISCOVER YAOUNDÉ</p>

        <h1>Find your next experience.</h1>

        <p>
          Explore the best cultural, natural and iconic places
          around Yaoundé.
        </p>
      </section>

      <section className="filters-section">
        <input
          type="text"
          placeholder="Search a destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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

      {loading ? (
        <p className="loading-message">
          Loading destinations...
        </p>
      ) : (
        <section className="destinations-grid">
          {filteredDestinations.length > 0 ? (
            filteredDestinations.map((destination) => (
              <div key={destination.id}>
                <DestinationCard destination={destination} />

                <Link
                  className="details-link"
                  to={`/destinations/${destination.id}`}
                >
                  View details →
                </Link>
              </div>
            ))
          ) : (
            <p>No destinations found.</p>
          )}
        </section>
      )}
    </main>
  );
}

export default Destinations;