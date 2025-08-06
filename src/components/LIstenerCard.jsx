import React from "react";
import logo from "../assets/LocalBeats.png"
import "./ListenerCard.css"

const ListenerCard = ({ element }) => {
    return (
        <main className="listener-card-container">
            <div className="listener-card-image">
                <img className="profile-image" src={logo} alt="Profile picture" />
            </div>

            <div className="listener-card-info">
                <p className="listener-card-name">Flo</p>
                <p className="listener-card-song">Like a Love Song</p>
                <p className="listener-card-location">New York, NY</p>
            </div>
            <div className="listener-card-status"> Playing</div>
        </main>
    )
}

export default ListenerCard;