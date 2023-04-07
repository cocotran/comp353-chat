import React from "react";
import { Routes, Route, Link  } from "react-router-dom";

import Home from "./Home";
import LandingPage from "./LandingPage";
import Auth from "./Auth";

function App() {
  return (
    <>
      <nav>
        <ul>
          <li><Link to="/">Landing Page</Link></li>
          <li><Link to="/auth">Sign In</Link></li>
          <li><Link to="/home">Home</Link></li>
        </ul>
      </nav>

      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
       </Routes>
    </>
  );
}

export default App;