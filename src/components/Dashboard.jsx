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

// --- Google Maps loader with PWA-safe promise cache ---
let googleMapsReady = null;
function loadGoogleMapsScript(apiKey) {
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }
  if (!googleMapsReady) {
    googleMapsReady = new Promise((resolve, reject) => {
      const existingScript = document.getElementById("google-maps-script");
      if (existingScript) {
        existingScript.addEventListener("load", resolve);
        existingScript.addEventListener("error", reject);
        return;
      }
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = resolve;
      script.onerror = (e) => {
        console.error("Failed to load Google Maps script", e);
        reject(e);
      };
      document.body.appendChild(script);
    });
  }
  return googleMapsReady;
}

function getSessionForUser(userObj, sessions) {
  if (!userObj || !sessions) return null;
  return sessions.find(
    (s) => s.user && (s.user.id === userObj.id || s.user.username === userObj.username)
  );
}

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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
  const [selectedLatLng, setSelectedLatLng] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allListeningSessions, setAllListeningSessions] = useState([]);
  const infoWindowRef = useRef(null);

  const [currentUserTrack, setCurrentUserTrack] = useState(null);

  // Poll all listening sessions
  useEffect(() => {
    let alive = true;
    async function fetchSessions() {
      try {
        const res = await axios.get("/api/listeners", { withCredentials: true });
        if (alive) setAllListeningSessions(res.data || []);
      } catch { /* ignore */ }
    }
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  // Geolocation + reverse geocode + send location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          setGeoError(null);

          try {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
            );
            const data = await res.json();
            if (data.status === "OK" && data.results.length > 0) {
              setAddress(data.results[0].formatted_address);
            } else {
              setAddress("");
            }
          } catch {
            setAddress("");
          }

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
<<<<<<< Updated upstream
        (error) => setGeoError(error.message || "Location permission denied.")
=======
        (error) => {
          setGeoError(error.message || "Location permission denied.");
        }
>>>>>>> Stashed changes
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

  // Initialize map (PWA-safe)
  useEffect(() => {
    if (coords && apiKey && mapRef.current) {
      loadGoogleMapsScript(apiKey)
        .then(() => {
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
          map.addListener("click", (event) => {
            setSelectedUser(null);
            setSelectedLatLng(null);
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
              infoWindowRef.current = null;
            }
            if (event && event.placeId) event.stop();
          });
          mapInstanceRef.current = map;
        })
        .catch(() => {
          alert("Google Maps failed to load. Check connection or API key.");
        });
    }
    return () => {
      markersRef.current.forEach((m) => m.setMap && m.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
      if (mapInstanceRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
      mapInstanceRef.current = null;
      setSelectedLatLng(null);
      setSelectedUser(null);
    };
  }, [coords, apiKey, mapKey]);

  // Render markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    onlineUsers.forEach((u) => {
      if (typeof u.latitude === "number" && typeof u.longitude === "number") {
        const isCurrentUser = u.username === user.username;
        const session = allListeningSessions.find(
          (s) => s.user && (s.user.id === u.id || s.user.username === u.username)
        );
        const cardUser = session?.user || u;
        const cardTrack =
          session?.song || {
            title: "No song playing",
            artist: "",
            album_art: "https://via.placeholder.com/80x80?text=No+Art",
            spotify_track_id: "",
          };

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
          if (!latLng) return;
          setSelectedLatLng({ lat: latLng.lat(), lng: latLng.lng() });

          if (infoWindowRef.current) infoWindowRef.current.close();

          const contentHtml = ReactDOMServer.renderToString(
            <div className="custom-infowindow-content">
              <ListenerCard user={cardUser} track={cardTrack} />
            </div>
          );
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div class="custom-infowindow-content">${contentHtml}</div>`,
            position: { lat: latLng.lat(), lng: latLng.lng() },
          });
          infoWindow.open(map);
          infoWindowRef.current = infoWindow;

          setTimeout(() => {
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
              const arrow = iw.parentElement.querySelector('div[style*="rotateZ(45deg)"]');
              if (arrow) arrow.style.display = "none";
              const arrowBg = iw.parentElement.querySelector('div[style*="background-color: white"]');
              if (arrowBg) arrowBg.style.display = "none";
            }
          }, 0);
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
          <ActiveListener user={user} setCurrentUserTrack={setCurrentUserTrack} />
        </section>
      )}
    </main>
  );
};

export default Dashboard;
