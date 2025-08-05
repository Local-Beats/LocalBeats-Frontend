import React from "react";
import logo from "../assets/LocalBeats.png"

const ListenerCard = () => {
    return (
        <main className="listener-card-container">
            <img className="listener-card-image" src={logo} alt="Profile picture" />
            <p className="listener-card-name">Flo</p>
            <p className="listener-card-genre">Bachata</p>
            <p className="listener-card-location">New York, NY</p>
            <p className="listener-card-status"> Playing</p>
        </main>
    )
}

export default ListenerCard;