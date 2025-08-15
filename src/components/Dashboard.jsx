import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance";
import ActiveListener from "./ActiveListener";
// import NowPlaying from "./NowPlaying";
import LocalBeatsImg from "../assets/LocalBeats.png";
import ListenerCard from "./ListenerCard";
import "./Dashboard.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import MapIcon from "@mui/icons-material/Map";
import NavBar from "./NavBar";

// Helper to get the listening session for a user
function getSessionForUser(userObj, sessions) {
  if (!userObj || !sessions) return null;
  return sessions.find(
    (s) => s.user && (s.user.id === userObj.id || s.user.username === userObj.username)
  );
}

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

  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [address, setAddress] = useState("");
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef(null);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPos, setSelectedUserPos] = useState(null); // { x, y } in px
  const [selectedLatLng, setSelectedLatLng] = useState(null);   // google.maps.LatLng
  const [allListeningSessions, setAllListeningSessions] = useState([]);

  // A persistent OverlayView used only to access map projection for pixel ↔ latlng
  const projectionOverlayRef = useRef(null);
  // To clean up map listeners
  const mapListenersRef = useRef([]);

  // Fetch all active listening sessions
  useEffect(() => {
    let alive = true;
    async function fetchSessions() {
      try {
        const res = await axios.get("/api/listeners", { withCredentials: true });
        if (alive) setAllListeningSessions(res.data || []);
      } catch (err) {}
    }
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  // Get current location
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
            .then((res) => res.json())
            .then((data) => {
              if (data.status === "OK" && data.results.length > 0) {
                setAddress(data.results[0].formatted_address);
              } else {
                setAddress("");
              }
            })
            .catch(() => setAddress(""));

          // Send location to backend
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
          setGeoError(error.message);
        }
      );
    } else {
      setGeoError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Fetch online users
  const fetchOnlineUsers = async () => {
    try {
      const res = await axios.get("/api/users/online", { withCredentials: true });
      setOnlineUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch online users:", err);
    }
  };

  // Poll online users
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

          mapInstanceRef.current = map;

          // Persistent, invisible overlay that gives us a stable projection object
          const overlay = new window.google.maps.OverlayView();
          overlay.onAdd = function () {};
          overlay.draw = function () {};
          overlay.onRemove = function () {};
          overlay.setMap(map);
          projectionOverlayRef.current = overlay;

          // Polygon removed: now clicking anywhere on the map (except markers) will close the popup
        }
      });
    }

    // Cleanup on key/coords change
    return () => {
      // Clear listeners
      mapListenersRef.current.forEach((l) => l && l.remove && l.remove());
      mapListenersRef.current = [];
      // Clear overlay
      if (projectionOverlayRef.current) {
        projectionOverlayRef.current.setMap(null);
        projectionOverlayRef.current = null;
      }
      // Clear markers
      markersRef.current.forEach((m) => m.setMap && m.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
      setSelectedUser(null);
      setSelectedUserPos(null);
      setSelectedLatLng(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, apiKey, mapKey]);

  // Place/update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Helper to compute & set popup pixel position (relative to map container)
    const positionPopupFromLatLng = (latLng) => {
      if (!latLng) return;
      const overlay = projectionOverlayRef.current;
      if (!overlay) return;

      const projection = overlay.getProjection && overlay.getProjection();
      if (!projection) return; // projection not ready yet

      const point = projection.fromLatLngToDivPixel(latLng);
      if (!point) return;

      // Always set position relative to map container
      setSelectedUserPos({ x: point.x, y: point.y });
    };

    onlineUsers.forEach((u) => {
      if (typeof u.latitude === "number" && typeof u.longitude === "number") {
        const isCurrentUser = u.username === user.username;

        const markerOptions = {
          position: { lat: u.latitude, lng: u.longitude },
          map,
          icon: isCurrentUser
            ? { url: LocalBeatsImg, scaledSize: new window.google.maps.Size(40, 40) }
            : {
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              },
        };

        const marker = new window.google.maps.Marker(markerOptions);

        // Clicking a marker: open/switch popup
        marker.addListener("click", () => {
          const latLng = marker.getPosition();
          setSelectedUser(u);
          setSelectedLatLng(latLng || null);
          positionPopupFromLatLng(latLng);
        });

        markersRef.current.push(marker);
      }
    });

    // Clicking anywhere on the map (including overlays/polygons): close popup
    const closePopup = () => {
      setSelectedUser(null);
      setSelectedUserPos(null);
      setSelectedLatLng(null);
    };
    const clickListener = map.addListener("click", closePopup);

    // Keep popup “locked” to marker on pan/zoom/resize
    const updatePopup = () => {
      if (selectedLatLng) positionPopupFromLatLng(selectedLatLng);
    };
    const idleListener = map.addListener("idle", updatePopup);
    const zoomListener = map.addListener("zoom_changed", updatePopup);
    const centerListener = map.addListener("center_changed", updatePopup);

    // Also close popup on polygon click (if any polygons are present)
    // (If you add more overlays, add similar listeners)
    // Example: if you have a polygon variable, you can do:
    // polygon.addListener('click', closePopup);

    mapListenersRef.current.push(clickListener, idleListener, zoomListener, centerListener);

    // Also re-position when window resizes (map div size changes)
    const handleResize = () => {
      if (selectedLatLng) positionPopupFromLatLng(selectedLatLng);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      [clickListener, idleListener, zoomListener, centerListener].forEach(
        (l) => l && l.remove && l.remove()
      );
      mapListenersRef.current = [];
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineUsers, mapKey, user, selectedLatLng]);

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

          {/* ListenerCard popup over map, anchored to selected marker */}
          {selectedUser && selectedUserPos && (() => {
            // Debug: log all relevant state
            console.log('--- Marker Clicked ---');
            console.log('selectedUser:', selectedUser);
            console.log('selectedUserPos:', selectedUserPos);
            console.log('selectedLatLng:', selectedLatLng);
            console.log('allListeningSessions:', allListeningSessions);
            // Log all onlineUsers and allListeningSessions IDs/usernames for comparison
            if (Array.isArray(onlineUsers)) {
              console.log('onlineUsers:', onlineUsers.map(u => ({ id: u.id, username: u.username })));
            }
            if (Array.isArray(allListeningSessions)) {
              console.log('allListeningSessions users:', allListeningSessions.map(s => s.user ? { id: s.user.id, username: s.user.username } : s));
            }
            const session = getSessionForUser(selectedUser, allListeningSessions);
            console.log('getSessionForUser result:', session);
            // Always render a popup for debugging
            return (
              <div
                className="dashboard-listenercard-popup"
                style={{
                  position: "absolute",
                  left: `${selectedUserPos.x - 20}px`,
                  top: `${selectedUserPos.y - 100}px`,
                  zIndex: 999,
                  pointerEvents: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  // border removed for alignment
                  backgroundColor: session && session.song ? "rgba(255,255,255,0.9)" : "rgba(255,230,200,0.9)",
                }}
              >
                {session && session.song ? (
                  <ListenerCard user={selectedUser} track={session.song} />
                ) : (
                  <div style={{ padding: 20, color: '#b71c1c', fontWeight: 'bold' }}>
                    No session or song found for this user.<br />
                    <div style={{ fontSize: 12, textAlign: 'left', marginTop: 8 }}>
                      <strong>selectedUser:</strong>
                      <pre>{JSON.stringify(selectedUser, null, 2)}</pre>
                      <strong>session:</strong>
                      <pre>{JSON.stringify(session, null, 2)}</pre>
                    </div>
                  </div>
                )}
                {/* little pointer */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderTop: session && session.song ? "16px solid white" : "16px solid orange",
                    marginTop: "-4px",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                  }}
                />
              </div>
            );
          })()}
        </div>
      )}

      {showResults && (
        <section className="dashboard-results-section">
          <div className="dashboard-results-header">
            <button
              className="dashboard-back-btn"
              onClick={() => {
                setShowResults(false);
                setMapKey((prev) => prev + 1); // Force map remount
              }}
              aria-label="Map"
            >
              <MapIcon className="MapIcon" /> Map
            </button>
            <div className="dashboard-header-texts"></div>
          </div>
          <ActiveListener user={user} />
        </section>
      )}
    </main>
  );
};

export default Dashboard;
