import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./NavBarStyles.css";
import logo from '../assets/LocalBeats.png'


const NavBar = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <Link to="/">
          <img className="navbar-logo" src={logo} alt="Logo" />
        </Link>
      </div>

      {user && (
        <>
          <div className="nav-user-info">
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
            <span className="username">{user.spotify_display_name || user.nickname}</span>
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
            {menuOpen && (
              <div className="hamburger-dropdown">
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default NavBar;
