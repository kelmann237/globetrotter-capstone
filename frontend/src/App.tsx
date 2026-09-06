import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import DestinationDetails from "./pages/DestinationDetails";
import MyTrips from "./pages/MyTrips";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recommendations from "./pages/Recommendations";
import Favorites from "./pages/Favorites";
import "./App.css";


function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route
  path="/destinations"
  element={<Destinations />}
/>

          <Route
  path="/recommendations"
  element={<Recommendations />}
/>
<Route
  path="/favorites"
  element={
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  }
/>

          <Route
  path="/trips"
  element={
    <ProtectedRoute>
      <MyTrips />
    </ProtectedRoute>
  }
/>

        <Route
  path="/login"
  element={<Login />}
/>

         <Route
  path="/register"
  element={<Register />}
/>
          <Route
  path="/destinations/:id"
  element={<DestinationDetails />}
/>
        </Routes>

        <footer>
          <div className="logo">
            Globe<span>Trotter</span>
          </div>

          <p>Discover Yaoundé. Create memories.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;