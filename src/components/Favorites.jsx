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
    const removed = favorites[idx];
    const updated = favorites.filter((_, i) => i !== idx);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    setRemoveIdx(null);
    // Dispatch event to notify ActiveListener to update heart
    if (removed && removed.user && removed.track) {
      window.dispatchEvent(new CustomEvent("favorite-removed", {
        detail: {
          userId: removed.user.id,
          songId: removed.track.song_id
        }
      }));
    }
  };

  return (
    <>
      <NavBar user={user} onLogout={onLogout || (() => {})} />
      <h2 style={{ textAlign: "center", margin: "40px 0 16px 0", color: "#222", fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>Favorites</h2>
      {favorites.length === 0 ? (
        <div style={{ textAlign: "center", color: "#666", fontSize: 18, marginTop: 32 }}>
          <p>Your favorite tracks and artists will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600, margin: "0 auto", padding: 0 }}>
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
                  <div
                    style={{
                      position: "absolute",
                      top: -38,
                      left: 0,
                      zIndex: 20,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start"
                    }}
                    onClick={() => setRemoveIdx(null)}
                  >
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 8,
                        boxShadow: "0 2px 12px #bbb",
                        padding: "8px 16px 8px 16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleRemove(idx)}
                        style={{ background: "#c82333", color: "#fff", border: "none", borderRadius: 6, padding: "4px 18px", fontSize: 15, cursor: "pointer" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Favorites;
