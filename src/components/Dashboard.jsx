import React, { useEffect, useState, useRef } from 'react';
import axios from "../utils/axiosInstance";
import ActiveListener from './ActiveListener';
import NowPlaying from './NowPlaying';
import LocalBeatsImg from '../assets/LocalBeats.png';



const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Helper to load Google Maps script
function loadGoogleMapsScript(apiKey, callback) {
    if (window.google && window.google.maps) {
        callback();
        return;
    }
    const existingScript = document.getElementById('google-maps-script');
    if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.onload = callback;
        script.onerror = function (e) {
            console.error("Failed to load Google Maps script", e);
            alert("Failed to load Google Maps. Check your API key and network.");
        };
        document.body.appendChild(script);
    } else {
        existingScript.onload = callback;
    }
}

const Dashboard = ({ user }) => {
    const [coords, setCoords] = useState(null);
    const [geoError, setGeoError] = useState(null);
    const [address, setAddress] = useState("");
    const mapRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    // const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (user) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        setCoords({ lat, lng });
                        setGeoError(null);
                        // Reverse geocode to get address
                        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`)
                            .then(res => res.json())
                            .then(data => {
                                if (data.status === "OK" && data.results.length > 0) {
                                    setAddress(data.results[0].formatted_address);
                                } else {
                                    setAddress("");
                                }
                            })
                            .catch(() => setAddress(""));

                        // Post location to backend (update user's location)
                        try {
                            await axios.post("/api/users/location", { latitude: lat, longitude: lng }, { withCredentials: true });
                        } catch (err) {
                            console.error("Failed to update location:", err);
                        }

                        // Fetch all online users (with locations)
                        try {
                            const res = await axios.get("/api/users/online", { withCredentials: true });
                            setOnlineUsers(res.data.users || []);
                            console.log("Fetched online users:", res.data.users);
                        } catch (err) {
                            console.error("Failed to fetch online users:", err);
                        }
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

    // Load Google Maps and render map when coords are available
    useEffect(() => {
        if (user && coords && apiKey && mapRef.current) {
            console.log("Attempting to load Google Maps...");
            loadGoogleMapsScript(apiKey, () => {
                if (window.google && window.google.maps) {
                    // Custom map style: hide POI and transit icons
                    const customMapStyle = [
                        {
                            featureType: "poi",
                            elementType: "labels.icon",
                            stylers: [{ visibility: "off" }]
                        },
                        {
                            featureType: "transit",
                            elementType: "labels.icon",
                            stylers: [{ visibility: "off" }]
                        }
                    ];

                    // Create the map centered on the user's location
                    const map = new window.google.maps.Map(mapRef.current, {
                        center: coords,
                        zoom: 12,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        zoomControl: false,
                        styles: customMapStyle,
                    });

                    // Draw polygon for NYC 5 boroughs (approximate coordinates)
                    const nycBoroughsCoords = [
                        { lat: 40.917577, lng: -73.700272 }, // NW Bronx
                        { lat: 40.915255, lng: -73.786137 }, // NE Bronx
                        { lat: 40.849255, lng: -73.786137 }, // SE Bronx
                        { lat: 40.5774, lng: -73.8371 },     // SE Brooklyn
                        { lat: 40.5116, lng: -74.2556 },     // SW Staten Island
                        { lat: 40.639722, lng: -74.081667 }, // NW Staten Island
                        { lat: 40.8007, lng: -74.0256 },     // NW Manhattan
                        { lat: 40.917577, lng: -73.700272 }, // Back to NW Bronx
                    ];
                    new window.google.maps.Polygon({
                        paths: nycBoroughsCoords,
                        strokeColor: "#2196f3",
                        strokeOpacity: 0.6,
                        strokeWeight: 2,
                        fillColor: "#90caf9",
                        fillOpacity: 0.25,
                        map: map,
                    });

                    // Add a marker for each online user (except current geolocation)
                    (onlineUsers || []).forEach(u => {
                        if (typeof u.latitude === "number" && typeof u.longitude === "number") {
                            // Don't render your own marker from backend if it matches your geolocation (avoid duplicate pin)
                            if (u.username === user.username && u.latitude === coords.lat && u.longitude === coords.lng) return;
                            let markerOptions = {
                                position: { lat: u.latitude, lng: u.longitude },
                                map,
                                title: u.username === user.username ? "You are here!" : u.username,
                                label: {
                                    text: u.username === user.username ? "You" : u.username,
                                    color: u.username === user.username ? "#8e24aa" : "#d32f2f",
                                    fontWeight: "bold",
                                },
                            };
                            // Use LocalBeats.png for your own marker, green pin for others
                            if (u.username === user.username) {
                                markerOptions.icon = {
                                    url: LocalBeatsImg,
                                    scaledSize: new window.google.maps.Size(40, 40),
                                };
                            } else {
                                markerOptions.icon = {
                                    url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                    scaledSize: new window.google.maps.Size(40, 40),
                                };
                            }
                            new window.google.maps.Marker(markerOptions);
                        }
                    });

                    // Always render LocalBeats.png for the current user's geolocation (matching address box)
                    if (coords && typeof coords.lat === "number" && typeof coords.lng === "number") {
                        new window.google.maps.Marker({
                            position: { lat: coords.lat, lng: coords.lng },
                            map,
                            title: "You are here!",
                            icon: {
                                url: LocalBeatsImg,
                                scaledSize: new window.google.maps.Size(40, 40),
                            },
                            label: {
                                text: "You",
                                color: "#8e24aa",
                                fontWeight: "bold",
                            },
                            zIndex: 9999,
                        });
                    }
                    console.log("Map rendered with users:", onlineUsers);
                } else {
                    console.error("Google Maps JS API not available after script load.");
                }
            });
        }
    }, [user, coords, apiKey, onlineUsers]);


    const locationBoxTop = 20; // px from top
    const locationBoxRight = -270; // px from right

    return (
        <main style={{ position: "relative" }}>
            <h1>Dashboard</h1>
            {/* Location info box for the current user */}
            {user && (
                <div
                    style={{
                        position: "absolute",
                        top: locationBoxTop,
                        right: locationBoxRight,
                        background: "#f5f5f5",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "12px 18px",
                        minWidth: "160px",
                        maxWidth: "260px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        fontSize: "14px",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        gap: "8px",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                    }}
                >
                    <strong>Your Location</strong>
                    <div style={{ marginTop: "8px", width: "100%", display: "flex", flexDirection: "column" }}>
                        {coords ? (
                            address ? (
                                <div style={{ color: "#333", fontWeight: 500, wordBreak: "break-word", whiteSpace: "pre-line" }}>{address}</div>
                            ) : (
                                <div>Fetching address...</div>
                            )
                        ) : geoError ? (
                            <div style={{ color: "#c00" }}>{geoError}</div>
                        ) : (
                            <div>Fetching location...</div>
                        )}
                    </div>
                </div>
            )}
            {/* Map container for Google Maps */}
            {user && coords && (
                <div
                    style={{
                        width: "600px",
                        height: "400px",
                        margin: "40px auto",
                        border: "2px solid #333",
                        borderRadius: "16px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                        overflow: "hidden",
                        background: "#eaeaea",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        ref={mapRef}
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
            )}
            <NowPlaying user={user} />
            <ActiveListener />
        </main>
    );
}

export default Dashboard;