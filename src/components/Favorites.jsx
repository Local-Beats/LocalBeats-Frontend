
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import ListenerCard from "./ListenerCard";

const Favorites = ({ user, onLogout }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("favorites");
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  return (
    <>
      <NavBar user={user} onLogout={onLogout || (() => {})} />
      <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, borderRadius: 12, boxShadow: "0 2px 12px #bbb", background: "#fff" }}>
        <h2 style={{ textAlign: "center", marginBottom: 16 }}>Favorites</h2>
        {favorites.length === 0 ? (
          <div style={{ textAlign: "center", color: "#666" }}>
            <p>Your favorite tracks and artists will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {favorites.map((fav, idx) => (
              <ListenerCard
                key={fav.track.song_id + "-" + fav.user.id + "-" + idx}
                user={fav.user}
                track={fav.track}
                variant="list"
                // Show emoji badge on card
                {...(fav.emoji ? { emoji: fav.emoji } : {})}
                // No popup/favorite in favorites view
                onFavorite={undefined}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Favorites;
