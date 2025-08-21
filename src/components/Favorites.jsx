import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import ListenerCard from "./ListenerCard";

const Favorites = ({ user, onLogout }) => {
  const [favorites, setFavorites] = useState([]);
  const [originalFavorites, setOriginalFavorites] = useState([]); // for reset
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("favorites");
      const parsed = stored ? JSON.parse(stored) : [];
      setFavorites(parsed);
      setOriginalFavorites(parsed);
    } catch {
      setFavorites([]);
      setOriginalFavorites([]);
    }
  }, []);

  // Close filter popup on outside click
  useEffect(() => {
    if (!filterOpen) return;
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filterOpen]);

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


  // Sort by song title alphabetical order
  const handleSortAlpha = () => {
    const sorted = [...favorites].sort((a, b) => {
      const tA = (a.track.title || '').toLowerCase();
      const tB = (b.track.title || '').toLowerCase();
      return tA.localeCompare(tB);
    });
    setFavorites(sorted);
    setFilterOpen(false);
  };

  // Sort by artist alphabetical order
  const handleSortArtist = () => {
    const sorted = [...favorites].sort((a, b) => {
      const aA = (a.track.artist || '').toLowerCase();
      const bA = (b.track.artist || '').toLowerCase();
      return aA.localeCompare(bA);
    });
    setFavorites(sorted);
    setFilterOpen(false);
  };

  // Reset to original order
  const handleReset = () => {
    setFavorites(originalFavorites);
    setFilterOpen(false);
  };

  // Delete all favorites
  const handleDeleteAll = () => {
    setFavorites([]);
    setOriginalFavorites([]);
    localStorage.setItem("favorites", JSON.stringify([]));
    setFilterOpen(false);
  };

  return (
    <>
      <NavBar user={user} onLogout={onLogout || (() => {})} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', margin: '40px 0 16px 0', gap: 12, position: 'relative', paddingLeft: 32 }}>
        <h2 style={{ color: "#222", fontWeight: 700, fontSize: 28, letterSpacing: 1, margin: 0, marginLeft: 24 }}>Favorites</h2>
        <button
          onClick={() => setFilterOpen(v => !v)}
          style={{
            background: '#bbd0ff',
            color: '#333',
            border: 'none',
            borderRadius: 6,
            padding: '6px 24px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #bbb',
            marginLeft: 20, // move button further to the right
            position: 'relative',
          }}
        >
          Settings
        </button>
        {filterOpen && (
          <div
            ref={filterRef}
            style={{
              position: 'absolute',
              top: 54,
              left: 'calc(50% + 60px)', // move popup to the right
              transform: 'translateX(-50%)',
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 2px 16px #bbb',
              padding: 18,
              zIndex: 1000,
              minWidth: 220,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'stretch',
            }}
          >
            <button
              onClick={handleSortAlpha}
              style={{
                background: '#bbd0ff',
                color: '#333',
                border: 'none',
                borderRadius: 5,
                padding: '14px 0', // taller, less wide
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Song title alphabetical order
            </button>
            <button
              onClick={handleSortArtist}
              style={{
                background: '#bbd0ff',
                color: '#333',
                border: 'none',
                borderRadius: 5,
                padding: '14px 0',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Artist alphabetical order
            </button>
            <button
              onClick={handleReset}
              style={{
                background: '#eee',
                color: '#333',
                border: 'none',
                borderRadius: 5,
                padding: '14px 0',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Remove filters
            </button>
            <button
              onClick={handleDeleteAll}
              style={{
                background: '#c82333',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '14px 0',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Delete all favorites
            </button>
          </div>
        )}
        {/* Overlay for closing popup on outside click */}
        {filterOpen && (
          <div
            onClick={() => setFilterOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 999,
              background: 'transparent',
            }}
          />
        )}
      </div>
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
