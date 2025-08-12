import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/LocalBeats.png";
import "./NavBarStyles.css";

const NavBar = ({ user, onLogout }) => {
  if (!user) {
    console.warn("No user found:", user);
    // return;
  }
  console.log("Current logged in user:", user);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/dashboard">
          <img src={logo} alt="LocalBeats logo" />
        </Link>
      </div>

      <div className="user-section">
        {/* Welcome message using Spotify display name or username */}
        {/* <span className="username">Hi, {user.spotify_display_name || user.username}!</span> */}

        {/* Optional: Show profile picture if available */}
        {/* {user.spotify_image && (
          <img
            src={user.spotify_image}
            alt="Profile picture icon"
            className="profile-pic"
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              marginRight: "10px",
            }}
          />
        )} */}

        {/* Logout button */}
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
