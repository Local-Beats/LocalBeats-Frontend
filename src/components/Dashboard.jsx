import React, { useEffect, useState, useRef } from 'react';
import axios from "../utils/axiosInstance";
import ActiveListener from './ActiveListener'
//import NowPlaying from './NowPlaying'



const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Helper to load Google Maps script
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
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (user) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                    (position) => {
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
      if (user && coords && apiKey && mapRef.current && !mapLoaded) {
        loadGoogleMapsScript(apiKey, () => {
          if (window.google && window.google.maps) {
            // Custom map style to hide POI icons (landmarks, transit, etc.)
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
              mapTypeControl: false, // Remove Map/Satellite icon
              streetViewControl: false, // Remove yellow man (Street View)
              fullscreenControl: false, // Remove fullscreen button
              zoomControl: false, // Remove zoom control (circle with arrows)
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
            new window.google.maps.Polygon({
              paths: nycBoroughsCoords,
              strokeColor: "#2196f3",
              strokeOpacity: 0.6,
              strokeWeight: 2,
              fillColor: "#90caf9",
              fillOpacity: 0.25,
              map: map,
            });

            // Add marker for user location
            new window.google.maps.Marker({
              position: coords,
              map,
              title: "You are here!",
            });
            setMapLoaded(true);
          }
        });
      }
    }, [user, coords, apiKey, mapLoaded]);

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
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "8px",
              maxWidth: "260px"
            }}
          >
            <strong>Your Location</strong>
            {coords ? (
              address ? (
                <div style={{ color: "#333", fontWeight: 500, wordBreak: "break-word" }}>{address}</div>
              ) : (
                <div>Fetching address...</div>
              )
            ) : geoError ? (
              <div style={{ color: "#c00" }}>{geoError}</div>
            ) : (
              <div>Fetching location...</div>
            )}
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
            {/* <NowPlaying user={user} /> */}
      </main>
    );
}

export default Dashboard;