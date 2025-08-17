
import React from "react";
import logo from "../assets/LocalBeats.png";
import "./ListenerCard.css";
import "./ListenerCardMap.css";
import spotifyLogo from "../assets/spotify-logo.png";

// variant: 'list' (default) or 'map'
const ListenerCard = ({ user, track, variant = "list" }) => {
  // For map variant, use special class and no scroll
  const isMap = variant === "map";
  const containerClass = isMap
    ? "listener-card-container listener-card-map"
    : "listener-card-container";

  return (
    <main
      className={containerClass}
      style={isMap ? { overflow: "visible", maxHeight: "none" } : {}}
    >
      <div className="listener-card-image">
        <img className="listener-card-album-art" src={track.album_art} />
        {/* <img className="profile-image" src={user?.spotify_image || logo} alt="Profile" /> */}
      </div>
      <div className="listener-card-info">
        <p className="listener-card-name">{user.spotify_display_name}</p>
        <p className="listener-card-song">{track.title}</p>
        <p className="listener-card-artist">{track.artist}</p>
        {/* <p className="listener-card-location">{loc}</p> */}
      </div>
      <div className="listener-card-spotify-container">
        <a
          href={`https://open.spotify.com/track/${track.spotify_track_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="listener-card-spotify" src={spotifyLogo} />
        </a>
      </div>
    </main>
  );
};

export default ListenerCard;
