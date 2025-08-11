import React from "react";
import logo from "../assets/LocalBeats.png"
import "./ListenerCard.css"

const ListenerCard = ({ user, track }) => {
    return (
        <main className="listener-card-container">
            <div className="listener-card-image">
                <img className="profile-image" src={track?.albumArt} alt="Profile picture" />
            </div>

            <div className="listener-card-info">
                <p className="listener-card-name">{user?.spotify_display_name}</p>
                <p className="listener-card-song">{track?.title}</p>
                <p className="listener-card-location">New York, NY</p>
            </div>
            <div className="listener-card-status"> Playing</div>
        </main>
    )
}

export default ListenerCard;