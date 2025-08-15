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
  const [selectedLatLng, setSelectedLatLng] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allListeningSessions, setAllListeningSessions] = useState([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    let alive = true;
    async function fetchSessions() {
      try {
        const res = await axios.get("/api/listeners", { withCredentials: true });
        if (alive) setAllListeningSessions(res.data || []);
      } catch {}
    }
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
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
          setGeoError(error.message);
        }
      );
    } else {
      setGeoError("Geolocation is not supported by this browser.");
    }
  }, []);

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

          // Prevent default InfoWindows for POIs (parks, neighborhoods, etc.)
          map.addListener("click", function(event) {
            if (event.placeId) {
              event.stop(); // Prevent default InfoWindow
            }
          });

          mapInstanceRef.current = map;
        }
      });
    }

    return () => {
      markersRef.current.forEach((m) => m.setMap && m.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
      mapInstanceRef.current = null;
      setSelectedLatLng(null);
      setSelectedUser(null);
    };
  }, [coords, apiKey, mapKey]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    onlineUsers.forEach((u) => {
      if (typeof u.latitude === "number" && typeof u.longitude === "number") {
        const isCurrentUser = u.username === user.username;

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

            // close existing infoWindow if any
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }

            let session = getSessionForUser(u, allListeningSessions);
            const cardTrack = session && session.song ? session.song : {
              title: "No song playing",
              artist: "",
              album_art: "https://via.placeholder.com/80x80?text=No+Art",
              spotify_track_id: ""
            };

            const contentHtml = ReactDOMServer.renderToString(
              <ListenerCard user={u} track={cardTrack} />
            );

            const infoWindow = new window.google.maps.InfoWindow({
              content: `<div style="max-width:200px">${contentHtml}</div>`,
              position: { lat: latLng.lat(), lng: latLng.lng() }
            });

            infoWindow.open(map);
            infoWindowRef.current = infoWindow;
          }
        });

        markersRef.current.push(marker);
      }
    });

    map.addListener("click", () => {
      setSelectedUser(null);
      setSelectedLatLng(null);
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    });
  }, [onlineUsers, mapKey, user, allListeningSessions]);

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
          <ActiveListener user={user} />
        </section>
      )}
    </main>
  );
};

export default Dashboard;
