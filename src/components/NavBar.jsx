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

  // Placeholder handlers for new menu options
  const handleProfile = () => {
    setMenuOpen(false);
    // TODO: Implement profile navigation
    alert('Profile page coming soon!');
  };
  const handleSettings = () => {
    setMenuOpen(false);
    // TODO: Implement settings navigation
    alert('Settings page coming soon!');
  };
  const handleContact = () => {
    setMenuOpen(false);
    // TODO: Implement contact us navigation
    alert('Contact Us page coming soon!');
  };
  const handleMap = () => {
    setMenuOpen(false);
    navigate('/dashboard'); // Adjust path if your map view route is different
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        {user ? (
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
              <button className="hamburger-menu-btn" onClick={handleProfile}>Profile</button>
              <button className="hamburger-menu-btn" onClick={handleContact}>Favorites</button>
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
