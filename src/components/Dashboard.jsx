import React, { useEffect, useState } from 'react';
//import ActiveListener from './ActiveListener';

const Dashboard = ({ user }) => {
    const [coords, setCoords] = useState(null);
    const [geoError, setGeoError] = useState(null);

    useEffect(() => {
        if (user) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setCoords({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                        setGeoError(null);
                    },
                    (error) => {
                        setGeoError(error.message);
                    }
                );
            } else {
                setGeoError("Geolocation is not supported by this browser.");
            }
        }
    }, [user]);

    
    const locationBoxTop = 20; // px from top
    const locationBoxRight = -380; // px from right
    

    return (
        <main style={{ position: "relative" }}>
            <h1>Dashboard</h1>
            {/* <ActiveListener user={user} /> */}
            {user && (
                <div
                    // --- This is the location box. Change top/right below to move it! ---
                    style={{
                        position: "absolute",
                        top: locationBoxTop, 
                        right: locationBoxRight, 
                        background: "#f5f5f5",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "12px 18px",
                        minWidth: "160px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        fontSize: "14px",
                        zIndex: 10
                    }}
                >
                    <strong>Your Location</strong>
                    <div style={{ marginTop: "8px" }}>
                        {coords ? (
                            <>
                                <div>Lat: {coords.lat.toFixed(5)}</div>
                                <div>Lng: {coords.lng.toFixed(5)}</div>
                            </>
                        ) : geoError ? (
                            <div style={{ color: "#c00" }}>{geoError}</div>
                        ) : (
                            <div>Fetching location...</div>
                        )}
                    </div>
                </div>
            )}
        </main>
    )
};

export default Dashboard;