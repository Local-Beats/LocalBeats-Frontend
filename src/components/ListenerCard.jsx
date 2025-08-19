import React, { useState, useEffect } from "react";
import logo from "../assets/LocalBeats.png";
import "./ListenerCard.css";
// import "./ListenerCardMap.css";
import spotifyLogo from "../assets/spotify-logo.png";
// import EmojiPopup from "./EmojiPopup";

// variant: 'list' (default) or 'map'
const ListenerCard = ({
  user,
  track,
  variant = "list",
  onFavorite,
  emoji: emojiProp,
  onEmojiClick,
}) => {
  const isMap = variant === "map";
  const containerClass = isMap
    ? "listener-card-container listener-card-map"
    : "listener-card-container";

  // Unique key for this card (user+track)
  const cardKey = `${user.id || user.username || ""}_${
    track.song_id || track.title
  }`;

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
  // No popup needed for new heart UX

  useEffect(() => {
    if (emoji && !emojiProp) {
      localStorage.setItem(`emoji_${cardKey}`, emoji);
    }
  }, [emoji, cardKey, emojiProp]);

  // Toggle heart state in ActiveListener
  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (!emoji && onFavorite) {
      setEmoji("❤️");
      onFavorite({ user, track, emoji: "❤️" });
    } else if (emoji === "❤️" && onFavorite) {
      setEmoji(null);
      // Remove from favorites in localStorage
      try {
        const stored = localStorage.getItem("favorites");
        let favs = stored ? JSON.parse(stored) : [];
        favs = favs.filter(
          (f) => !(f.user.id === user.id && f.track.song_id === track.song_id)
        );
        localStorage.setItem("favorites", JSON.stringify(favs));
      } catch {}
    }
  };

  // --- EMOJI BADGE STYLE ---
  // To move/resize the emoji badge, edit the style below:
  // Example: top: 2px, left: 2px, fontSize: 22
  // This is the spot to adjust for your design needs!

  return (
    <main
      className={containerClass}
      style={
        isMap
          ? { overflow: "visible", maxHeight: "none" }
          : { position: "relative" }
      }
    >
      {/* Heart badge for ActiveListener (not in favorites view) */}
      {typeof onFavorite === "function" && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: -10,
            fontSize: 20,
            zIndex: 2,
            background: "rgba(255,255,255,0.85)",
            borderRadius: "50%",
            padding: "2px 4px",
            minWidth: 24,
            minHeight: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: emoji ? 1 : 0.7,
          }}
          onClick={handleHeartClick}
        >
          <span
            style={{
              color: emoji ? "#e53935" : "#bbb",
              filter: emoji ? "none" : "grayscale(1)",
              transition: "color 0.2s",
            }}
          >
            ❤️
          </span>
        </div>
      )}
      {/* Emoji badge for favorites view (read-only, but clickable for remove) */}
      {typeof onFavorite !== "function" && emoji && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: -10,
            fontSize: 20,
            zIndex: 2,
            background: "rgba(255,255,255,0.85)",
            borderRadius: "50%",
            padding: "2px 4px",
            minWidth: 24,
            minHeight: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: onEmojiClick ? "pointer" : undefined,
          }}
          onClick={onEmojiClick}
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
          onClick={(e) => e.stopPropagation()} // Don't trigger popup when clicking Spotify
        >
          <img className="listener-card-spotify" src={spotifyLogo} />
        </a>
        {/* <div>
          <iframe
            src={`https://open.spotify.com/embed/track/${track.spotify_track_id}`}
            width="100%"
            height="500px"
          ></iframe>
        </div> */}
      </div>
      {/* (showPopup and EmojiPopup removed: no longer needed) */}
    </main>
  );
};

export default ListenerCard;
