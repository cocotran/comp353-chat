import React from "react";
import "./App.css";

function LandingPage() {
  return (
    <div className="landing-page">
      <h1 className="landing-page__title">Welcome to Chat App!</h1>
      <p className="landing-page__subtitle">Chat App is a simple and secure messaging platform for teams.</p>
      <p className="landing-page__description">With Chat App, you can:</p>
      <ul className="landing-page__list">
        <li>Create channels for different projects, teams, or topics</li>
        <li>Post messages and replies to keep everyone in the loop</li>
        <li>View all channels and select the one you want to join</li>
      </ul>
      <p className="landing-page__join">Join our community today and start collaborating with your team!</p>
    </div>
  );
}

export default LandingPage;
