import React from "react";
import { Routes, Route, Link  } from "react-router-dom";

import Home from "./Home";
import LandingPage from "./LandingPage";

function App() {
  return (
    <>
      <nav>
        <ul>
          <li><Link to="/">Landing Page</Link></li>
          <li><Link to="/home">Home</Link></li>
        </ul>
      </nav>

      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
       </Routes>
    </>
  );
}

export default App;