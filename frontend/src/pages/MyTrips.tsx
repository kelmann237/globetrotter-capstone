import { useEffect, useState } from "react";
import { createItinerary, getDestinations, getItineraries } from "../services/api";

interface Destination {
  id: number;
  name: string;
  category: string;
  location: string;
  budget: string;
  rating: number;
  description: string;
  image: string | null;
}

interface Itinerary {
  id: number;
  user_id: number;
  title: string;
  destination_ids: number[];
  start_date: string;
  end_date: string;
}

function MyTrips() {
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  const [title, setTitle] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [destinationData, itineraryData] = await Promise.all([
          getDestinations(),
          getItineraries()
        ]);

        setDestinations(destinationData);
        setItineraries(itineraryData);
      } catch (error) {
        console.error("Error loading trips:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleDestination = (destinationId: number) => {
    setSelectedDestinations((current) =>
      current.includes(destinationId)
        ? current.filter((id) => id !== destinationId)
        : [...current, destinationId]
    );
  };

  const handleCreateItinerary = async () => {
    setMessage("");

    if (!title || !startDate || !endDate) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (selectedDestinations.length === 0) {
      setMessage("Please select at least one destination.");
      return;
    }

    try {
      setCreating(true);

      const newItinerary = await createItinerary(
  title,
  selectedDestinations,
  startDate,
  endDate
);

      setItineraries((current) => [...current, newItinerary]);

      setTitle("");
      setSelectedDestinations([]);
      setStartDate("");
      setEndDate("");

      setMessage("Your trip has been created successfully.");
    } catch (error) {
      console.error("Error creating itinerary:", error);
      setMessage("Unable to create the trip.");
    } finally {
      setCreating(false);
    }
  };

  const getDestinationName = (destinationId: number) => {
    const destination = destinations.find(
      (item) => item.id === destinationId
    );

    return destination?.name ?? "Unknown destination";
  };

  if (loading) {
    return (
      <main className="section">
        <p>Loading your trips...</p>
      </main>
    );
  }

  return (
    <main className="trips-page">
      <section className="trips-header">
        <p className="eyebrow">MY TRAVEL PLANS</p>
        <h1>My Trips</h1>
        <p>
          Create and organize your perfect experiences around Yaoundé.
        </p>
      </section>

      <section className="create-trip-card">
        <div>
          <p className="eyebrow">CREATE A NEW TRIP</p>
          <h2>Plan your next adventure</h2>
        </div>

        <div className="trip-form">
          <label>
            Trip title
            <input
              type="text"
              placeholder="Weekend in Yaoundé"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div className="date-fields">
            <label>
              Start date
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label>
              End date
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <div className="destination-selection">
            <h3>Choose your destinations</h3>

            <div className="selection-grid">
              {destinations.map((destination) => (
                <button
                  type="button"
                  key={destination.id}
                  className={
                    selectedDestinations.includes(destination.id)
                      ? "selection-item selected"
                      : "selection-item"
                  }
                  onClick={() => toggleDestination(destination.id)}
                >
                  <strong>{destination.name}</strong>
                  <span>{destination.category}</span>
                </button>
              ))}
            </div>
          </div>

          {message && <p className="trip-message">{message}</p>}

          <button
            className="primary-btn create-trip-btn"
            onClick={handleCreateItinerary}
            disabled={creating}
          >
            {creating ? "Creating..." : "Create My Trip →"}
          </button>
        </div>
      </section>

      <section className="existing-trips">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR ITINERARIES</p>
            <h2>Upcoming trips</h2>
          </div>
        </div>

        {itineraries.length === 0 ? (
          <div className="empty-trips">
            <h3>No trips yet</h3>
            <p>Create your first Yaoundé itinerary above.</p>
          </div>
        ) : (
          <div className="trip-grid">
            {itineraries.map((itinerary) => (
              <article className="trip-card" key={itinerary.id}>
                <p className="eyebrow">TRIP #{itinerary.id}</p>

                <h3>{itinerary.title}</h3>

                <p>
                  {itinerary.start_date} → {itinerary.end_date}
                </p>

                <div className="trip-destinations">
                  {itinerary.destination_ids.map((destinationId) => (
                    <span key={destinationId}>
                      {getDestinationName(destinationId)}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyTrips;