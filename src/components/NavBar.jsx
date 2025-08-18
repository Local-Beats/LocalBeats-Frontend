import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import "./NavBarStyles.css";
import logo from '../assets/LocalBeats.png';
import logo2 from "../assets/Beat-Nav.png";


const NavBar = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfilePic, setShowProfilePic] = useState(false);
  // Determine the profile picture URL
  const profilePicUrl = user && (user.spotify_image || user.picture || (user.images && user.images[0] && user.images[0].url));

  // Alternate between logo and profile picture every 5 seconds
  useEffect(() => {
    if (!user || !profilePicUrl) return;
    const interval = setInterval(() => {
      setShowProfilePic((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, [user, profilePicUrl]);

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        {user && profilePicUrl ? (
          <div className="flip-card-navbar" style={{ width: "85px", height: "85px" }}>
            <div className={`flip-card-inner-navbar${showProfilePic ? " flipped" : ""}`} style={{ width: "100%", height: "100%" }}>
              <div className="flip-card-front-navbar" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, backfaceVisibility: "hidden" }}>
                <img
                  className="navbar-logo"
                  src={logo2}
                  alt="Logo"
                  style={{ cursor: "pointer", width: "85px", height: "85px", borderRadius: "0%", objectFit: "cover" }}
                  onClick={() => window.location.reload()}
                />
              </div>
              <div className="flip-card-back-navbar" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <img
                  className="navbar-logo"
                  src={profilePicUrl}
                  alt="Profile"
                  style={{ cursor: "pointer", width: "85px", height: "85px", borderRadius: "50%", objectFit: "cover" }}
                  onClick={() => window.location.reload()}
                />
              </div>
            </div>
          </div>
        ) : user ? (
          <img
            className="navbar-logo"
            src={logo2}
            alt="Logo"
            style={{ cursor: "pointer" }}
            onClick={() => window.location.reload()}
          />
        ) : (
          <Link to="/">
            <img className="navbar-logo" src={logo2} alt="Logo" />
          </Link>
        )}
      </div>

      {user && (
        <>
          <div className="nav-user-info">
            <div className="username-stack">
              {/* <span className="username-welcome">Welcome:</span> */}
              <span className="navbar-app-name">Local Beats</span>
              <span className="username">{user.spotify_display_name || user.display_name || user.nickname}</span>
            </div>
          </div>
          <div className="hamburger-container">
            <button
              className={`McButton${menuOpen ? " active" : ""}`}
              aria-label="Open menu"
              onClick={handleMenuToggle}
              data-hamburger-menu
            >
              <b></b>
              <b></b>
              <b></b>
            </button>
          </div>
          {menuOpen && createPortal(
            <div className="hamburger-dropdown hamburger-dropdown-portal">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>,
            document.body
          )}
        </>
      )}
    </nav>
  );
};

export default NavBar;
