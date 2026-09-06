import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePreference = (preference: string) => {
    setPreferences((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : [...current, preference]
    );
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser(
        name,
        email,
        password,
        preferences,
        budget
      );

      navigate("/login");
    } catch (error) {
      console.error(error);
      setError("Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">JOIN GLOBETROTTER</p>

          <h1>Create your account</h1>

          <p>
            Start discovering the best experiences in Yaoundé.
          </p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <label>
            Name
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>

          <div className="preference-section">
            <h3>What do you like?</h3>

            <div className="preference-options">
              {["Culture", "Nature", "Landmark"].map(
                (preference) => (
                  <button
                    type="button"
                    key={preference}
                    className={
                      preferences.includes(preference)
                        ? "preference-btn selected"
                        : "preference-btn"
                    }
                    onClick={() =>
                      togglePreference(preference)
                    }
                  >
                    {preference}
                  </button>
                )
              )}
            </div>
          </div>

          <label>
            Preferred budget

            <select
              value={budget}
              onChange={(event) =>
                setBudget(event.target.value)
              }
            >
              <option value="">Choose a budget</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-btn auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account →"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;