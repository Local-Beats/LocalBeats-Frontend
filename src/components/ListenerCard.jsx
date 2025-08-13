import React from "react";
import logo from "../assets/LocalBeats.png"
import "./ListenerCard.css"


const ListenerCard = ({ user, track }) => {
    // Fallbacks for missing data
    // const displayName = user?.spotify_display_name || user?.nickname || user?.username || "Unknown";
    // const songTitle = track?.title || "No song playing";
    // const songArtist = track?.artist || "";
    // const songAlbumArt = track?.albumArt || "";
    // const loc = location || user?.location || "Unknown location";

    return (
        <main className="listener-card-container">

            <div className="listener-card-image">
                <img className="listener-card-album-art" src={track.album_art} />
                {/* <img className="profile-image" src={user?.spotify_image || logo} alt="Profile" /> */}
            </div>
            <div className="listener-card-info">
                <p className="listener-card-name">{user.spotify_display_name}</p>
                <p className="listener-card-song">{track.title}{track.artist ? ` — ${track.artist}` : ""}</p>

                {/* <p className="listener-card-location">{loc}</p> */}
            </div>


        </main>
    );
}

export default ListenerCard;