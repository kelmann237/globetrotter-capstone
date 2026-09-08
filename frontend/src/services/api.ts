import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getDestinations = async () => {
  const response = await api.get("/destinations/");
  return response.data;
};

export const getDestination = async (id: number) => {
  const response = await api.get(`/destinations/${id}`);
  return response.data;
};

export const getRecommendations = async () => {
  const token = localStorage.getItem("access_token");

  const response = await api.get("/recommendations/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  preferences: string[],
  budget: string
) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    preferences,
    budget,
  });

  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const createItinerary = async (
  title: string,
  destinationIds: number[],
  startDate: string,
  endDate: string
) => {
  const token = localStorage.getItem("access_token");

  const response = await api.post(
    "/itineraries/",
    {
      title,
      destination_ids: destinationIds,
      start_date: startDate,
      end_date: endDate,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getItineraries = async () => {
  const token = localStorage.getItem("access_token");

  const response = await api.get("/itineraries/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getFavorites = async () => {
  const token = localStorage.getItem("access_token");

  const response = await api.get("/favorites/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const addFavorite = async (destinationId: number) => {
  const token = localStorage.getItem("access_token");

  const response = await api.post(
    `/favorites/${destinationId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const removeFavorite = async (destinationId: number) => {
  const token = localStorage.getItem("access_token");

  const response = await api.delete(
    `/favorites/${destinationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export default api;