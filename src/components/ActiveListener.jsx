import React from "react";
import ListenerCard from "./ListenerCard";

const Activelistener = ({ user }) => {
    // console.log("this is user from actiive listener---> ", user)
    return (
        <main>
            <h1>
                Active Listeners
            </h1>
            <div className="active-listener-cards">
                <ul>
                    {user.map((element) => (
                        <li key={element.id}>
                            <ListenerCard element={element} />
                        </li>
                    ))}
                </ul>
            </div>

        </main>
    )
}

export default Activelistener;