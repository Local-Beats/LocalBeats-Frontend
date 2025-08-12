import React from "react";
import logo from "../assets/LocalBeats.png"
import "./ListenerCard.css"


const ListenerCard = ({ user, track, location, status }) => {
    // Fallbacks for missing data
    const displayName = user?.spotify_display_name || user?.nickname || user?.username || "Unknown";
    const songTitle = track?.title || "No song playing";
    const songArtist = track?.artist || "";
    const songAlbum = track?.album || "";
    const loc = location || user?.location || "Unknown location";
    const stat = status || track?.status || "Idle";

    return (
        <main className="listener-card-container">
            <div className="listener-card-image">
                <img className="profile-image" src={user?.picture || logo} alt="Profile" />
            </div>
            <div className="listener-card-info">
                <p className="listener-card-name">{displayName}</p>
                <p className="listener-card-song">{songTitle}{songArtist ? ` — ${songArtist}` : ""}</p>
                {songAlbum && <p className="listener-card-album"><em>{songAlbum}</em></p>}
                <p className="listener-card-location">{loc}</p>
            </div>
            <div className="listener-card-status">{stat}</div>
        </main>
    );
}

export default ListenerCard;