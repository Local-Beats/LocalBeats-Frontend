import React, { useEffect, useState, useRef } from 'react';
import axios from "../utils/axiosInstance";
//import ActiveListener from './ActiveListener';


const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
console.log("Google Maps API Key:", apiKey);

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
    script.onerror = function(e) {
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
    const [onlineUsers, setOnlineUsers] = useState([]);
    const mapRef = useRef(null);
    // const [mapLoaded, setMapLoaded] = useState(false); // Remove for debugging

    // Get current user's location, post to backend, and fetch all online users
    useEffect(() => {
        if (user) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        setCoords({ lat, lng });
                        setGeoError(null);
                        console.log("Geolocation success:", lat, lng);
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

                        // Post location to backend
                        try {
                            await axios.post("/api/users/location", { latitude: lat, longitude: lng }, { withCredentials: true });
                        } catch (err) {
                            console.error("Failed to update location:", err);
                        }

                        // Fetch all online users
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
                        console.error("Geolocation error:", error);
                    }
                );
            } else {
                setGeoError("Geolocation is not supported by this browser.");
                console.error("Geolocation is not supported by this browser.");
            }
        }
    }, [user]);

    // Load Google Maps and render map with all online users
    useEffect(() => {
      if (user && coords && apiKey && mapRef.current) {
        console.log("Attempting to load Google Maps...");
        loadGoogleMapsScript(apiKey, () => {
          if (window.google && window.google.maps) {
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
              map: map,
            });

            // Add a marker for each online user
            (onlineUsers || []).forEach(u => {
              if (typeof u.latitude === "number" && typeof u.longitude === "number") {
                new window.google.maps.Marker({
                  position: { lat: u.latitude, lng: u.longitude },
                  map,
                  title: u.username === user.username ? "You are here!" : u.username,
                  icon: u.username === user.username ? undefined : {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: "#1DB954",
                    fillOpacity: 1,
                    strokeColor: "#333",
                    strokeWeight: 1,
                  },
                  label: {
                    text: u.username === user.username ? "You" : u.username,
                    color: u.username === user.username ? "#1976d2" : "#1DB954",
                    fontWeight: "bold",
                  },
                });
              }
            });
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
        {/* <ActiveListener user={user} /> */}
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
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              fontSize: "14px",
              zIndex: 10,
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
        {/* Map Box */}
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
      </main>
    );
}

export default Dashboard;