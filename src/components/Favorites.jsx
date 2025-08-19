import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

const Favorites = ({ user, onLogout }) => {
  // Placeholder for user's favorite tracks/artists
  return (
    <>
      <NavBar user={user} onLogout={onLogout || (() => {})} />
      <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, borderRadius: 12, boxShadow: "0 2px 12px #bbb", background: "#fff" }}>
        <h2 style={{ textAlign: "center", marginBottom: 16 }}>Favorites</h2>
        <div style={{ textAlign: "center", color: "#666" }}>
          <p>Your favorite tracks and artists will appear here.</p>
        </div>
      </div>
    </>
  );
};

export default Favorites;
