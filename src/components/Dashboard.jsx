import React, { useEffect, useState, useRef } from 'react';
import axios from "../utils/axiosInstance";
import ActiveListener from './ActiveListener';
// import NowPlaying from './NowPlaying';
import LocalBeatsImg from '../assets/LocalBeats.png';
import './Dashboard.css';

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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
    if (!user) return null;

    const [coords, setCoords] = useState(null);
    const [geoError, setGeoError] = useState(null);
    const [address, setAddress] = useState("");
    const [mapKey, setMapKey] = useState(0);
    const mapRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // Get current location and post to backend
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCoords({ lat, lng });
                    setGeoError(null);

                    // Reverse geocode
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

                    // Update backend with location
                    try {
                        await axios.post("/api/users/location", { latitude: lat, longitude: lng }, { withCredentials: true });
                    } catch (err) {
                        console.error("Failed to update location:", err);
                    }
                },
                (error) => {
                    setGeoError(error.message);
                }
            );
        } else {
            setGeoError("Geolocation is not supported by this browser.");
        }
    }, []);

    // Function to fetch online users
    const fetchOnlineUsers = async () => {
        try {
            const res = await axios.get("/api/users/online", { withCredentials: true });
            setOnlineUsers(res.data.users || []);
        } catch (err) {
            console.error("Failed to fetch online users:", err);
        }
    };

    // Poll online users every 10 seconds
    useEffect(() => {
        if (user) {
            fetchOnlineUsers();
            const interval = setInterval(fetchOnlineUsers, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Load map once coords are set
    useEffect(() => {
        if (coords && apiKey && mapRef.current) {
            loadGoogleMapsScript(apiKey, () => {
                if (window.google && window.google.maps) {
                    const customMapStyle = [
                        { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                        { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
                    ];

                    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                        center: coords,
                        zoom: 12,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        zoomControl: false,
                        styles: customMapStyle,
                    });

                    // NYC borough polygon
                    const nycBoroughsCoords = [
                        { lat: 40.917577, lng: -73.700272 },
                        { lat: 40.915255, lng: -73.786137 },
                        { lat: 40.849255, lng: -73.786137 },
                        { lat: 40.5774, lng: -73.8371 },
                        { lat: 40.5116, lng: -74.2556 },
                        { lat: 40.639722, lng: -74.081667 },
                        { lat: 40.8007, lng: -74.0256 },
                        { lat: 40.917577, lng: -73.700272 },
                    ];
                    new window.google.maps.Polygon({
                        paths: nycBoroughsCoords,
                        strokeColor: "#2196f3",
                        strokeOpacity: 0.6,
                        strokeWeight: 2,
                        fillColor: "#90caf9",
                        fillOpacity: 0.25,
                        map: mapInstanceRef.current,
                    });
                }
            });
        }
    }, [coords, apiKey]);

    // Update markers whenever onlineUsers changes
    useEffect(() => {
        if (mapInstanceRef.current) {
            // Clear old markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            // Add markers for users
            onlineUsers.forEach(u => {
                if (typeof u.latitude === "number" && typeof u.longitude === "number") {
                    const isCurrentUser = u.username === user.username &&
                        u.latitude === coords?.lat &&
                        u.longitude === coords?.lng;

                                let markerOptions = {
                                    position: { lat: u.latitude, lng: u.longitude },
                                    map: mapInstanceRef.current,
                                };

                    if (isCurrentUser) {
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

                    const marker = new window.google.maps.Marker(markerOptions);
                    markersRef.current.push(marker);
                }
            });
        }
    }, [onlineUsers, coords, user]);

    return (
        <main className="dashboard-main">
            {!showResults && <h1 className="dashboard-title">Dashboard</h1>}

            {user && !showResults && (
                <div className="dashboard-location-box">
                    <strong>Your Location</strong>
                    <div style={{ marginTop: "8px", width: "100%", display: "flex", flexDirection: "column" }}>
                        {coords ? (
                            address ? <div className="dashboard-address">{address}</div> : <div>Fetching address...</div>
                        ) : geoError ? (
                            <div className="dashboard-error">{geoError}</div>
                        ) : (
                            <div>Fetching location...</div>
                        )}
                    </div>
                </div>
            )}

            {user && coords && !showResults && (
                <div className="dashboard-map-container">
                    <div ref={mapRef} className="dashboard-map" key={mapKey} />
                    <button className="dashboard-bubble-btn" onClick={() => setShowResults(true)}>
                        See Results
                    </button>
                </div>
            )}

            {showResults && (
                <section className="dashboard-results-section">
                    <div className="dashboard-results-header">
                        <button
                            className="dashboard-back-btn"
                            onClick={() => {
                                setShowResults(false);
                                setMapKey(prev => prev + 1); // Force map remount
                            }}
                            aria-label="Back to Map"
                        >
                            Back to Map
                        </button>
                        <div className="dashboard-header-texts">
                            <h1 className="dashboard-title dashboard-title-results">Dashboard</h1>
                            <h2 className="dashboard-results-title">Your Currently Playing:</h2>
                        </div>
                    </div>
                    {/* <NowPlaying user={user} /> */}
                    <ActiveListener user={user} />
                </section>
            )}
        </main>
    );
};

export default Dashboard;
