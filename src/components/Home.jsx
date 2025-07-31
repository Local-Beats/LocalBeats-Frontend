import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // or your correct path for useAuth hook
import { ThemeContext } from "./ThemeContext";
import "./HomeStyles.css"; // her CSS file with all styles

// The pattern image URL — adjust path if needed
const backgroundPatternUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='100' viewBox='0 0 600 100'%3E%3Crect fill='%23ffffff' width='600' height='100'/%3E%3Cg stroke='%23FFF' stroke-width='0' stroke-miterlimit='10'%3E%3Ccircle fill='%23037B79' cx='0' cy='0' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='100' cy='0' r='50'/%3E%3Ccircle fill='%23FFFFD8' cx='200' cy='0' r='50'/%3E%3Ccircle fill='%23CAF2FF' cx='300' cy='0' r='50'/%3E%3Ccircle fill='%236FCCFF' cx='400' cy='0' r='50'/%3E%3Ccircle fill='%23006EB4' cx='500' cy='0' r='50'/%3E%3Ccircle fill='%23037B79' cx='600' cy='0' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='-50' cy='50' r='50'/%3E%3Ccircle fill='%2353AC9A' cx='50' cy='50' r='50'/%3E%3Ccircle fill='%23CEEDC1' cx='150' cy='50' r='50'/%3E%3Ccircle fill='%23FFFFFF' cx='250' cy='50' r='50'/%3E%3Ccircle fill='%239DE0FE' cx='350' cy='50' r='50'/%3E%3Ccircle fill='%233E9CDA' cx='450' cy='50' r='50'/%3E%3Ccircle fill='%2300789C' cx='550' cy='50' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='650' cy='50' r='50'/%3E%3Ccircle fill='%23037B79' cx='0' cy='100' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='100' cy='100' r='50'/%3E%3Ccircle fill='%23FFFFD8' cx='200' cy='100' r='50'/%3E%3Ccircle fill='%23CAF2FF' cx='300' cy='100' r='50'/%3E%3Ccircle fill='%236FCCFF' cx='400' cy='100' r='50'/%3E%3Ccircle fill='%23006EB4' cx='500' cy='100' r='50'/%3E%3Ccircle fill='%23037B79' cx='600' cy='100' r='50'/%3E%3Ccircle fill='%23CAF2FF' cx='50' cy='150' r='50'/%3E%3Ccircle fill='%236FCCFF' cx='150' cy='150' r='50'/%3E%3Ccircle fill='%239DE0FE' cx='250' cy='150' r='50'/%3E%3Ccircle fill='%2353AC9A' cx='350' cy='150' r='50'/%3E%3Ccircle fill='%23CEEDC1' cx='450' cy='150' r='50'/%3E%3Ccircle fill='%23FFFFD8' cx='550' cy='150' r='50'/%3E%3C/g%3E%3C/svg%3E`;

const Home = () => {
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Set the CSS variable --bg-pattern on body for background
    document.body.style.setProperty("--bg-pattern", `url("${backgroundPatternUrl}")`);
    // Also add body class for theme if you want
    document.body.classList.add(theme);
    return () => {
      document.body.style.removeProperty("--bg-pattern");
      document.body.classList.remove(theme);
    };
  }, [theme]);

  const handleCreate = () => {
    if (user) navigate("/create");
    else navigate("/login");
  };

  const handleBrowse = () => {
    if (user) navigate("/polls");
    else navigate("/signup");
  };

  // Use your illustration images depending on theme
  const illustration = theme === "dark"
    ? require("./assets/illustration-light.jpg")
    : require("./assets/illustration-dark.jpg");

  return (
    <div className="home-section">
      <main className="home-content">
        <div className="home-left">
          <h2 className="headline">Create and share polls easily</h2>
          <p className="subtext">
            Get instant feedback from your audience by creating polls in just a few clicks.
          </p>
          <div className="home-buttons">
            <button className="create-btn" onClick={handleCreate}>Create Poll</button>
            <button className="browse-btn" onClick={handleBrowse}>Browse Polls</button>
          </div>
        </div>
        <div className="home-right">
          <img src={illustration} alt="Illustration" className="home-img" />
        </div>
      </main>
    </div>
  );
};

export default Home;

