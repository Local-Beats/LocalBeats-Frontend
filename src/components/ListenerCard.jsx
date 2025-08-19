
import React, { useState, useEffect } from "react";
import logo from "../assets/LocalBeats.png";
import "./ListenerCard.css";
import "./ListenerCardMap.css";
import spotifyLogo from "../assets/spotify-logo.png";
import EmojiPopup from "./EmojiPopup";

// variant: 'list' (default) or 'map'
const ListenerCard = ({ user, track, variant = "list", onFavorite, emoji: emojiProp }) => {
  const isMap = variant === "map";
  const containerClass = isMap
    ? "listener-card-container listener-card-map"
    : "listener-card-container";

  // Unique key for this card (user+track)
  const cardKey = `${user.id || user.username || ""}_${track.song_id || track.title}`;

  // Emoji state: persistent per card using localStorage
  const [emoji, setEmoji] = useState(() => {
    if (emojiProp) return emojiProp;
    try {
      const stored = localStorage.getItem(`emoji_${cardKey}`);
      return stored || null;
    } catch {
      return null;
    }
  });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (emoji && !emojiProp) {
      localStorage.setItem(`emoji_${cardKey}`, emoji);
    }
  }, [emoji, cardKey, emojiProp]);

  // For favorites, freeze the card's info
  const handleEmojiSelect = (selectedEmoji) => {
    setEmoji(selectedEmoji);
    setShowPopup(false);
    if (selectedEmoji === "❤️" && onFavorite) {
      // Save the card to favorites (with emoji and all info)
      onFavorite({ user, track, emoji: selectedEmoji });
    }
  };

  // For demo, show popup on click (not on map variant)
  const handleCardClick = (e) => {
    if (!isMap && onFavorite) setShowPopup(true);
  };

  // --- EMOJI BADGE STYLE ---
  // To move/resize the emoji badge, edit the style below:
  // Example: top: 2px, left: 2px, fontSize: 22
  // This is the spot to adjust for your design needs!

  return (
    <main
      className={containerClass}
      style={isMap ? { overflow: "visible", maxHeight: "none" } : { position: "relative", cursor: !isMap ? "pointer" : undefined }}
      onClick={handleCardClick}
    >
      {/* Emoji badge */}
      {emoji && (
        <div
          style={{
            position: "absolute",
            top: -10, // Move higher (was 4)
            left: -10, // Move more left (was 4)
            fontSize: 20,
            zIndex: 2,
            background: "rgba(255,255,255,0.85)",
            borderRadius: "50%",
            padding: "2px 4px",
            minWidth: 24,
            minHeight: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {emoji}
        </div>
      )}
      <div className="listener-card-image">
        <img className="listener-card-album-art" src={track.album_art} />
      </div>
      <div className="listener-card-info">
        <p className="listener-card-name">{user.spotify_display_name}</p>
        <p className="listener-card-song">{track.title}</p>
        <p className="listener-card-artist">{track.artist}</p>
      </div>
      <div className="listener-card-spotify-container">
        <a
          href={`https://open.spotify.com/track/${track.spotify_track_id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()} // Don't trigger popup when clicking Spotify
        >
          <img className="listener-card-spotify" src={spotifyLogo} />
        </a>
      </div>
      {showPopup && !isMap && (
        <EmojiPopup
          onSelect={handleEmojiSelect}
          onClose={() => setShowPopup(false)}
        />
      )}
    </main>
  );
};

export default ListenerCard;
