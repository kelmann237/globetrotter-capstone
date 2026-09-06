import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        Globe<span>Trotter</span>
      </Link>

      <nav>
  <Link to="/">Home</Link>
  <Link to="/destinations">Destinations</Link>
  <Link to="/recommendations">Recommendations</Link>
  <Link to="/favorites">Favorites ♥</Link>
  <Link to="/trips">My Trips</Link>
</nav>

      <div className="nav-actions">
        {isLoggedIn ? (
          <button
            className="login-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">
              <button className="login-btn">
                Login
              </button>
            </Link>

            <Link to="/register">
              <button className="signup-btn">
                Get Started
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;