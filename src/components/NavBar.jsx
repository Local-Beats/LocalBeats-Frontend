import React from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import "./NavBarStyles.css";
import logo from '../assets/LocalBeats.png';
import logo2 from "../assets/Beat-Nav.png";



const NavBar = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  // Determine the profile picture URL
  const profilePicUrl = user && (user.spotify_image || user.picture || (user.images && user.images[0] && user.images[0].url));

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  // Navigation handlers for menu options
  const handleProfile = () => {
    setMenuOpen(false);
    navigate('/profile');
  };
  const handleFavorites = () => {
    setMenuOpen(false);
    navigate('/favorites');
  };
  const handleSettings = () => {
    setMenuOpen(false);
    alert('Settings page coming soon!');
  };
  const handleDashboard = () => {
    setMenuOpen(false);
    navigate('/dashboard');
  };

  // Make logo always go to dashboard if user is logged in
  const handleLogoClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img
          className="navbar-logo"
          src={logo2}
          alt="Logo"
          style={{ cursor: "pointer" }}
          onClick={handleLogoClick}
        />
      </div>

      {user && (
        <>
          <div className="nav-user-info">
            <div className="username-stack">
              <span className="navbar-app-name">Local Beats</span>
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
              {profilePicUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                  <img
                    src={profilePicUrl}
                    alt="Profile"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 4 }}
                  />
                  <span style={{ fontWeight: 500, fontSize: '1.05rem', color: '#333', marginTop: 2, marginBottom: 8 }}>
                    Welcome, {user.spotify_display_name || user.display_name || user.nickname}
                  </span>
                </div>
              )}
              <button className="hamburger-menu-btn" onClick={handleDashboard}>Dashboard</button>
              <button className="hamburger-menu-btn" onClick={handleProfile}>Profile</button>
              <button className="hamburger-menu-btn" onClick={handleFavorites}>Favorites</button>
              <button className="hamburger-menu-btn" onClick={handleSettings}>Settings</button>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>,
            document.body
          )}
        </>
      )}
    </nav>
  );
};

export default NavBar;
