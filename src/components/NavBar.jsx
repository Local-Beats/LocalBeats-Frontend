import React from "react";
import { Link } from "react-router-dom";
import "./NavBarStyles.css";
import logo from '../assets/LocalBeats.png'

const NavBar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <img className="navbar-logo" src={logo} alt="Logo" />
        </Link>
      </div>

      <div className="nav-links">
        {user ? (
          <div className="user-section">
            {/* Optional: Show profile picture if available */}
            {user.picture && (
              <img
                src={user.picture}
                alt="Profile"
                className="profile-pic"
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              />
            )}

            {/* Welcome message using name or nickname */}
            <span className="username">Welcome, {user.spotify_display_name || user.nickname}!</span>

            {/* Logout button */}
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
  ) : null}
      </div>
    </nav>
  );
};

export default NavBar;
