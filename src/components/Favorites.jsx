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

  // State to track which card's heart was clicked
  const [removeIdx, setRemoveIdx] = useState(null);

  // Remove favorite at index
  const handleRemove = (idx) => {
    const updated = favorites.filter((_, i) => i !== idx);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    setRemoveIdx(null);
  };

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
            {favorites.map((fav, idx) => {
              // Only show remove popup for the selected card
              const showRemove = removeIdx === idx;
              return (
                <div key={fav.track.song_id + "-" + fav.user.id + "-" + idx} style={{ position: "relative" }}>
                  <ListenerCard
                    user={fav.user}
                    track={fav.track}
                    variant="list"
                    emoji={fav.emoji}
                    // Intercept heart click for removal
                    onEmojiClick={fav.emoji === "❤️" ? () => setRemoveIdx(idx) : undefined}
                    onFavorite={undefined}
                  />
                  {showRemove && (
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(0,0,0,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10
                    }}>
                      <div style={{ background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 2px 12px #bbb", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: 22, marginBottom: 12 }}>Remove from favorites?</div>
                        <button onClick={() => handleRemove(idx)} style={{ background: "#c82333", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontSize: 16, cursor: "pointer", marginBottom: 8 }}>Remove</button>
                        <button onClick={() => setRemoveIdx(null)} style={{ background: "#eee", color: "#333", border: "none", borderRadius: 6, padding: "6px 18px", fontSize: 15, cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Favorites;
