import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance";
import ActiveListener from "./ActiveListener";
import BeatNavImg from "../assets/Beat-Nav.png";
import ListenerCard from "./ListenerCard";
import "./Dashboard.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import MapIcon from "@mui/icons-material/Map";
import NavBar from "./NavBar";
import ReactDOMServer from "react-dom/server";
import "./ListenerCard.css";

// function getSessionForUser(userObj, sessions) {
//     if (!userObj || !sessions) return null;
//     return sessions.find(
//         (s) => s.user && (s.user.id === userObj.id || s.user.username === userObj.username)
//     );
// }

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function loadGoogleMapsScript(apiKey, callback) {
    if (window.google && window.google.maps) {
        callback();
        return;
    }
    const existingScript = document.getElementById("google-maps-script");
    if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
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

const Dashboard = ({ user, onLogout }) => {
    if (!user) return null;

    // const syncCurrentUserSession = async () => {
    //     try {
    //         await axios.post("/api/listeners", null, { withCredentials: true });
    //         console.log(" Synced current user's session");
    //     } catch (err) {
    //         console.error(" Failed to sync current user's session:", err);
    //     }
    // };

    const [coords, setCoords] = useState(null);
    const [geoError, setGeoError] = useState(null);
    const [address, setAddress] = useState("");
    const [mapKey, setMapKey] = useState(0);
    const mapRef = useRef(null);

    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [selectedLatLng, setSelectedLatLng] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [allListeningSessions, setAllListeningSessions] = useState([]);
    console.log("this is all listenins sessions from dashboard", allListeningSessions)
    const infoWindowRef = useRef(null);

    // Used as a fallback when the current user's session isn't found yet
    const [currentUserTrack, setCurrentUserTrack] = useState(null);



    const fetchSessions = async () => {
        try {
            const res = await axios.get("/api/listeners", { withCredentials: true });
            const sessions = res.data;

            // ✅ Only update if we got meaningful data
            if (Array.isArray(sessions) && sessions.length > 0) {
                console.log("✅ Setting new sessions");
                setAllListeningSessions(sessions);
            } else {
                console.warn("⚠️ Skipped setting empty sessions");
            }

        } catch (err) {
            console.error("Failed to fetch sessions", err);
        }
    };

    // Poll all listening sessions
    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 8000);
        return () => clearInterval(interval);
    }, []);

    // Geolocation + reverse geocode + send location to server
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCoords({ lat, lng });
                    setGeoError(null);

                    fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
                    )
                        .then((res) => res.json())
                        .then((data) => {
                            if (data.status === "OK" && data.results.length > 0) {
                                setAddress(data.results[0].formatted_address);
                            } else {
                                setAddress("");
                            }
                        })
                        .catch(() => setAddress(""));

                    try {
                        await axios.post(
                            "/api/users/location",
                            { latitude: lat, longitude: lng },
                            { withCredentials: true }
                        );
                    } catch (err) {
                        console.error("Failed to update location:", err);
                    }
                },
                (error) => {
                    setGeoError(error.message || "Location permission denied.");
                }
            );
        } else {
            setGeoError("Geolocation is not supported by your browser.");
        }
    }, []);

    // Poll online users
    const fetchOnlineUsers = async () => {
        try {
            const res = await axios.get("/api/users/online", { withCredentials: true });
            setOnlineUsers(res.data.users || []);
        } catch (err) {
            console.error("Failed to fetch online users:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOnlineUsers();
            const interval = setInterval(fetchOnlineUsers, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Initialize map
    useEffect(() => {
        if (coords && apiKey && mapRef.current) {
            loadGoogleMapsScript(apiKey, () => {
                if (window.google && window.google.maps) {
                    const customMapStyle = [
                        { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                        { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                    ];

                    const map = new window.google.maps.Map(mapRef.current, {
                        center: coords,
                        zoom: 12,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        zoomControl: false,
                        styles: customMapStyle,
                    });

                    // Close any open ListenerCard when clicking on the map.
                    // Also prevent default POI InfoWindows.
                    map.addListener("click", (event) => {
                        // Always close our custom card on any map click
                        setSelectedUser(null);
                        setSelectedLatLng(null);
                        if (infoWindowRef.current) {
                            infoWindowRef.current.close();
                            infoWindowRef.current = null;
                        }
                        // Prevent Google default POI InfoWindow if a placeId is present
                        if (event && event.placeId) {
                            event.stop();
                        }
                    });

                    mapInstanceRef.current = map;
                    // ✅ Trigger initial sync of current user's session
                    // syncCurrentUserSession();
                    // setTimeout(syncCurrentUserSession, 10000);
                }
            });
        }

        return () => {
            // Cleanup
            markersRef.current.forEach((m) => m.setMap && m.setMap(null));
            markersRef.current = [];
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
                infoWindowRef.current = null;
            }
            if (mapInstanceRef.current && window.google && window.google.maps && window.google.maps.event) {
                window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
            }
            mapInstanceRef.current = null;
            setSelectedLatLng(null);
            setSelectedUser(null);
        };
    }, [coords, apiKey, mapKey]);

    // Render markers + attach click to open clean ListenerCard-only InfoWindow
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clear previous markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        onlineUsers.forEach((u) => {
            if (typeof u.latitude === "number" && typeof u.longitude === "number") {
                const isCurrentUser = u.username === user.username;

                // Find the exact session for this user, just like ActiveListener
                const session = allListeningSessions.find(s => s.user.id === u.id);

                const marker = new window.google.maps.Marker({
                    position: { lat: u.latitude, lng: u.longitude },
                    map,
                    icon: isCurrentUser
                        ? { url: BeatNavImg, scaledSize: new window.google.maps.Size(40, 40) }
                        : {
                            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                            scaledSize: new window.google.maps.Size(40, 40),
                        },
                });

                marker.addListener("click", () => {
                    const latLng = marker.getPosition();
                    setSelectedUser(u);
                    if (latLng) {
                        setSelectedLatLng({ lat: latLng.lat(), lng: latLng.lng() });

                        // Close existing infoWindow if any
                        if (infoWindowRef.current) {
                            infoWindowRef.current.close();
                        }

                        // Refetch session for this user
                        const session = allListeningSessions.find((s) => s.user_id === u.id || s.user?.id === u.id);
                        const cardUser = session?.user || u;
                        const cardTrack = session?.song || {
                            title: "No song playing",
                            artist: "",
                            album_art: "/images/no-art.png", // Use your local fallback or online placeholder
                            spotify_track_id: "",
                        };

                        // Render ListenerCard to static HTML string
                        const contentHtml = ReactDOMServer.renderToString(
                            <div className="custom-infowindow-content">
                                <ListenerCard user={cardUser} track={cardTrack} />
                            </div>
                        );

                        // Create and show InfoWindow
                        const infoWindow = new window.google.maps.InfoWindow({
                            content: contentHtml,
                            position: { lat: latLng.lat(), lng: latLng.lng() },
                        });

                        infoWindow.open(map);
                        infoWindowRef.current = infoWindow;

                        // Fix styling: remove scroll, arrows, and background
                        setTimeout(() => {
                            const iwScrollWrapper = document.querySelector(".gm-style-iw-d");
                            if (iwScrollWrapper) {
                                iwScrollWrapper.style.overflow = "visible";
                                iwScrollWrapper.style.maxHeight = "unset";
                            }

                            const iw = document.querySelector(".gm-style-iw");
                            if (iw && iw.parentElement) {
                                iw.parentElement.style.background = "none";
                                iw.parentElement.style.boxShadow = "none";
                                iw.parentElement.style.border = "none";
                                iw.style.background = "none";
                                iw.style.boxShadow = "none";
                                iw.style.border = "none";

                                const closeBtn = iw.parentElement.querySelector('button[aria-label="Close"]');
                                if (closeBtn) closeBtn.style.display = "none";

                                const arrow = iw.parentElement.querySelector('div[style*="transform: rotateZ(45deg)"]');
                                if (arrow) arrow.style.display = "none";

                                const arrowBg = iw.parentElement.querySelector('div[style*="background-color: white"]');
                                if (arrowBg) arrowBg.style.display = "none";
                            }
                        }, 0);
                    }
                });


                markersRef.current.push(marker);
            }
        });
    }, [onlineUsers, mapKey, user, allListeningSessions, currentUserTrack]);

    return (
        <main className="dashboard-main">
            <div className="navbar-container">
                <NavBar user={user} onLogout={onLogout} />
            </div>

            {user && coords && !showResults && (
                <div className="dashboard-map-container" style={{ position: "relative" }}>
                    <div ref={mapRef} className="dashboard-map" key={mapKey} />
                    <button className="dashboard-bubble-btn" onClick={() => setShowResults(true)}>
                        <FormatListBulletedIcon className="ListIcon" /> List
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
                                setMapKey((prev) => prev + 1);
                            }}
                            aria-label="Map"
                        >
                            <MapIcon className="MapIcon" /> Map
                        </button>
                        <div className="dashboard-header-texts"></div>
                    </div>
                    {/* Passing setter—ActiveListener may choose to update it; harmless if ignored */}
                    <ActiveListener user={user} setCurrentUserTrack={setCurrentUserTrack} />
                </section>
            )}
        </main>
    );
};

export default Dashboard;
