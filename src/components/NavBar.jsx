import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ThemeContext } from "./ThemeContext";
import "./NavBarStyles.css";
import logoDark from "./assets/logo.jpg";     // now dark mode logo
import logoLight from "./assets/logo2.jpg";   // now light mode logo

const NavBar = ({ user, onLogout }) => {
  const {
    isAuthenticated,
    user: auth0User,
    logout: auth0Logout,
    isLoading,
  } = useAuth0();
  const [isHovered, setIsHovered] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    if (isAuthenticated) {
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    } else {
      onLogout();
    }
  };

  const displayName = isAuthenticated
    ? auth0User?.name || auth0User?.email
    : user?.username;

  const handleThemeChange = () => {
    toggleTheme();
  };

  // Switched logic: logo2.png is now used for light mode
  const currentLogo = theme === "dark" ? logoDark : logoLight;

  // Optional: preload both logos to prevent flicker
  useEffect(() => {
    const preload = new Image();
    preload.src = theme === "dark" ? logoDark : logoLight;
  }, [theme]);

  return (
    <div
      className={`navbar-container ${isHovered ? "hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="nav-brand">
        <Link to="/">
          <img src={currentLogo} alt="Logo" className="logo-image" />
          <span className="instapoll-text">Instapoll</span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/create" className="nav-link">
          Create a Poll
        </Link>

        {(user || isAuthenticated) && (
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
        )}

        {!user && !isAuthenticated && !isLoading ? (
          <div className="auth-links">
            <Link to="/signup" className="nav-link">
              Sign Up
            </Link>
            <div className="login-slider-container">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={theme === "dark"}
                  onChange={handleThemeChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        ) : (
          <div className="user-section">
            <span className="username">Welcome, {displayName}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
            <label className="switch" style={{ marginLeft: "10px" }}>
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={handleThemeChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
