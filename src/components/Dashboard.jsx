import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance";
import ActiveListener from "./ActiveListener";
import BeatNavImg from "../assets/Beat-Nav.png";
import UserIcon from "../assets/UserIcon.gif";
import OtherUserIcon from "../assets/OtherUserIcon.png";
import ListenerCard from "./ListenerCard";
import "./Dashboard.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import MapIcon from "@mui/icons-material/Map";
import NavBar from "./NavBar";
import ReactDOMServer from "react-dom/server";
import "./ListenerCard.css";
import OtherUsersBeet from "../assets/Other_users_beet.png";
import DummyMarkers from "./DummyMarkers";
import backgroundImage from "../assets/3.1.png";

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Utility function (this can be outside the component)
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
  // Used as a fallback when the current user's session isn't found yet
  const [currentUserTrack, setCurrentUserTrack] = useState(null);

  // Poll all listening sessions
  useEffect(() => {
    let alive = true;
    async function fetchSessions() {
      try {
        const res = await axios.get("/api/listeners", {
          withCredentials: true,
        });
        if (alive) setAllListeningSessions(res.data || []);
      } catch {
        // ignore
      }
    }
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
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
      const res = await axios.get("/api/users/online", {
        withCredentials: true,
      });
      let users = res.data.users || [];
      // Ensure current user is present with latest coords
      if (user && coords) {
        const alreadyPresent = users.some((u) => u.username === user.username);
        if (!alreadyPresent) {
          users = [
            ...users,
            {
              ...user,
              latitude: coords.lat,
              longitude: coords.lng,
            },
          ];
        }
      }
      setOnlineUsers(users);
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
            {
              featureType: "poi",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }],
            },
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
      if (
        mapInstanceRef.current &&
        window.google &&
        window.google.maps &&
        window.google.maps.event
      ) {
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
        const session = allListeningSessions.find(
          (s) =>
            s.user && (s.user.id === u.id || s.user.username === u.username)
        );
        const cardUser = session?.user || u;
        const cardTrack = session?.song || {
          title: "No song playing",
          artist: "",
          album_art: "https://via.placeholder.com/80x80?text=No+Art",
          spotify_track_id: "",
        };

        const marker = new window.google.maps.Marker({
          position: { lat: u.latitude, lng: u.longitude },
          map,
          icon: isCurrentUser
            ? {
                url: BeatNavImg,
                scaledSize: new window.google.maps.Size(40, 40),
              }
            : {
                url: OtherUsersBeet, // imported
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

            // Render ListenerCard as the only content, no extra box
            const contentHtml = ReactDOMServer.renderToString(
              <div className="custom-infowindow-content">
                <ListenerCard user={cardUser} track={cardTrack} variant="map" />
              </div>
            );

            const infoWindow = new window.google.maps.InfoWindow({
              content: contentHtml,
              position: { lat: latLng.lat(), lng: latLng.lng() },
            });

            infoWindow.open(map);
            infoWindowRef.current = infoWindow;

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

                const closeBtn = iw.parentElement.querySelector(
                  'button[aria-label="Close"]'
                );
                if (closeBtn) closeBtn.style.display = "none";

                const arrow = iw.parentElement.querySelector(
                  'div[style*="transform: rotateZ(45deg)"]'
                );
                if (arrow) arrow.style.display = "none";

                const arrowBg = iw.parentElement.querySelector(
                  'div[style*="background-color: white"]'
                );
                if (arrowBg) arrowBg.style.display = "none";
              }
            }, 0);
          }
        });

        markersRef.current.push(marker);
      }
    });
  }, [onlineUsers, mapKey, user, allListeningSessions, currentUserTrack]);

  // //add background
  // // Set amy-background2.png as background only on this page
  // useEffect(() => {
  //   const originalBg = document.body.style.background;
  //   document.body.style.background = `url(${require("../assets/0.png")}) no-repeat center center fixed`;
  //   document.body.style.backgroundSize = "cover";
  //   document.body.style.backgroundAttachment = "fixed";
  //   return () => {
  //     document.body.style.background = originalBg;
  //     document.body.style.backgroundSize = "";
  //     document.body.style.backgroundAttachment = "";
  //   };
  // }, []);

  useEffect(() => {
    const originalBg = document.body.style.background;

    document.body.style.backgroundImage = `url(${backgroundImage})`;
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";

    return () => {
      document.body.style.background = originalBg;
      document.body.style.backgroundImage = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundAttachment = "";
    };
  }, []);

  return (
    <main className="dashboard-main">
      <div className="navbar-container">
        <NavBar user={user} onLogout={onLogout} />
      </div>

      {user && coords && !showResults && (
        <div
          className="dashboard-map-container"
          style={{ position: "relative" }}
        >
          <div ref={mapRef} className="dashboard-map" key={mapKey} />
          {/* DUMMY MARKERS: comment out next line to hide test beets */}
          <DummyMarkers map={mapInstanceRef.current} />
          <button
            className="dashboard-bubble-btn"
            onClick={() => setShowResults(true)}
          >
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
          <ActiveListener
            user={user}
            setCurrentUserTrack={setCurrentUserTrack}
          />
        </section>
      )}
    </main>
  );
};

export default Dashboard;
