import React, { useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            password,
          })
      }).then(data => data.json());

      localStorage.setItem("signin", JSON.stringify(response.signin));
      localStorage.setItem("userId", JSON.stringify(response.userId));
      setLoggedIn(response.signin);
    } catch (error) {
      setError("Invalid username or password.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            password,
          })
      }).then(data => data.json());

      localStorage.setItem("signin", JSON.stringify(response.signin));
      localStorage.setItem("userId", JSON.stringify(response.userId));
      setLoggedIn(response.signin);
    } catch (error) {
      setError("Unable to create account. Please try again later.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  if (loggedIn) {
    return (
      <div>
        <p>You are logged in!</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Sign In</button>
      </form>
      {error && <p>{error}</p>}
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Sign Up</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Auth;
