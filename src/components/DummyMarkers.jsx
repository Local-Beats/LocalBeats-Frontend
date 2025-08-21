// DummyMarkers.jsx
// Renders 50 fixed beet markers across NYC for testing (no InfoWindows)
import React, { useEffect } from "react";
import OtherUsersBeet from "../assets/OtherUserIcon.png"; // use bundled asset

// Fixed coordinates for 10 locations in each borough (50 total)
const FIXED_NYC_COORDS = [
  // Manhattan
  { lat: 40.7831, lng: -73.9712 }, // Central Park
  // // { lat: 40.7484, lng: -73.9857 }, // Empire State Building
  // { lat: 40.73061, lng: -73.935242 }, // East Village
  { lat: 40.8075, lng: -73.9626 }, // Columbia University
  // { lat: 40.758, lng: -73.9855 }, // Times Square
  { lat: 40.7295, lng: -73.9965 }, // NYU
  // { lat: 40.7527, lng: -73.9772 }, // Grand Central
  // { lat: 40.748817, lng: -73.985428 }, // Midtown
  { lat: 40.7648, lng: -73.9808 }, // Lincoln Center
  // { lat: 40.7061, lng: -74.0087 }, // Wall Street
  // Brooklyn
  { lat: 40.6782, lng: -73.9442 }, // Bed-Stuy
  { lat: 40.6501, lng: -73.9496 }, // Flatbush
  { lat: 40.678178, lng: -73.944158 }, // Crown Heights
  // { lat: 40.6951, lng: -73.9956 }, // Brooklyn Heights
  // { lat: 40.7081, lng: -73.9571 }, // Williamsburg
  // { lat: 40.6413, lng: -73.7781 }, // JFK Airport
  // { lat: 40.6631, lng: -73.9389 }, // Prospect Park
  // { lat: 40.6786, lng: -73.9654 }, // Clinton Hill
  { lat: 40.6932, lng: -73.9895 }, // Downtown Brooklyn
  { lat: 40.67, lng: -73.94 }, // Lefferts Gardens
  // Queens
  { lat: 40.7282, lng: -73.7949 }, // Flushing
  { lat: 40.7498, lng: -73.7976 }, // Murray Hill
  { lat: 40.7421, lng: -73.7694 }, // Bayside
  { lat: 40.757, lng: -73.8458 }, // Corona
  { lat: 40.7433, lng: -73.9182 }, // Astoria
  { lat: 40.756, lng: -73.8301 }, // Forest Hills
  { lat: 40.7282, lng: -73.7949 }, // Flushing Meadows
  { lat: 40.7498, lng: -73.7976 }, // Murray Hill
  { lat: 40.7421, lng: -73.7694 }, // Bayside
  { lat: 40.757, lng: -73.8458 }, // Corona
  // Bronx
  { lat: 40.8448, lng: -73.8648 }, // Fordham
  { lat: 40.837, lng: -73.8654 }, // Belmont
  { lat: 40.8506, lng: -73.887 }, // Kingsbridge
  { lat: 40.8265, lng: -73.9229 }, // Mott Haven
  { lat: 40.837, lng: -73.8654 }, // Belmont
  { lat: 40.8448, lng: -73.8648 }, // Fordham
  { lat: 40.8506, lng: -73.887 }, // Kingsbridge
  { lat: 40.8265, lng: -73.9229 }, // Mott Haven
  { lat: 40.837, lng: -73.8654 }, // Belmont
  { lat: 40.8448, lng: -73.8648 }, // Fordham
  // Staten Island
  { lat: 40.5795, lng: -74.1502 }, // St. George
  { lat: 40.613, lng: -74.0631 }, // New Dorp
  { lat: 40.5612, lng: -74.1202 }, // Great Kills
  // { lat: 40.5763, lng: -74.103 }, // Dongan Hills
  // { lat: 40.5895, lng: -74.1515 }, // Port Richmond
  // { lat: 40.583, lng: -74.1496 }, // Tompkinsville
  // { lat: 40.5707, lng: -74.1365 }, // Tottenville
  // { lat: 40.5431, lng: -74.19 }, // Huguenot
  { lat: 40.5795, lng: -74.1502 }, // St. George
  { lat: 40.613, lng: -74.0631 }, // New Dorp
];

const DummyMarkers = ({ map }) => {
  useEffect(() => {
    if (!map || !window.google) return;

    const markers = FIXED_NYC_COORDS.map(({ lat, lng }) => {
      return new window.google.maps.Marker({
        position: { lat, lng },
        map,
        icon: {
          url: OtherUsersBeet, // bundled path
          scaledSize: new window.google.maps.Size(40, 40),
        },
        zIndex: 2,
      });
    });

    // Cleanup on unmount or when map changes
    return () => {
      markers.forEach((m) => m.setMap(null));
    };
  }, [map]);

  return null;
};

export default DummyMarkers;
