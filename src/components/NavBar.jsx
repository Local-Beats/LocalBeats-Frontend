import React from "react";
import { Link } from "react-router-dom";
import "./NavBarStyles.css";

const NavBar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Capstone I</Link>
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
            <span className="username">Welcome, {user.name || user.nickname}!</span>

            {/* Logout button */}
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-links">
            {/* Links to login/signup when not authenticated */}
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-link">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
