import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

const Profile = ({ user, onLogout }) => {

  const navigate = useNavigate();
  // Additional info state (persisted to localStorage for demo)
  const [extra, setExtra] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("profileExtra") || '{}');
    } catch {
      return {};
    }
  });
  const [locationEnabled, setLocationEnabled] = React.useState(() => {
    const val = localStorage.getItem("locationEnabled");
    return val === null ? true : val === "true";
  });

  if (!user) return <div style={{ padding: 32 }}>You must be logged in to view your profile.</div>;
  const profilePicUrl = user.spotify_image || user.picture || (user.images && user.images[0] && user.images[0].url);

  const handleChange = e => {
    const { name, value } = e.target;
    setExtra(prev => ({ ...prev, [name]: value }));
  };
  const handleLocationToggle = () => {
    setLocationEnabled(prev => {
      localStorage.setItem("locationEnabled", !prev);
      return !prev;
    });
  };
  const handleSave = e => {
    e.preventDefault();
    localStorage.setItem("profileExtra", JSON.stringify(extra));
    alert("Profile info saved!");
  };

  return (
    <>
      <NavBar user={user} onLogout={onLogout || (() => {})} />
      {/*
        === PROFILE BOX DIMENSIONS ===
        To adjust the width and alignment of the profile box for mobile/desktop,
        edit maxWidth, width, margin, and alignItems below.
        Example: maxWidth: 340 for a smaller box, width: '100%' for responsive.
      */}
      <div
        style={{
          width: "100%", // <-- Edit width for responsiveness
          maxWidth: 340, // <-- Edit maxWidth for desktop/mobile size
          minWidth: 0,
          margin: "40px auto 0 auto", // <-- Edit margin for vertical/horizontal position
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // <-- Edit alignment
        }}
      >
        <img
          src={profilePicUrl}
          alt="Profile"
          style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", marginBottom: 16, display: "block", marginLeft: "auto", marginRight: "auto" }}
        />
        <h2 style={{ textAlign: "center", marginBottom: 8, color: "#222", fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>{user.spotify_display_name || user.display_name || user.nickname}</h2>
        <div style={{ textAlign: "center", color: "#666", marginBottom: 16, fontSize: 18 }}>{user.email}</div>
        <div style={{ textAlign: "center", color: "#888", marginBottom: 16 }}>
          <div><b>Spotify ID:</b> {user.spotify_id || user.id}</div>
          {user.country && <div><b>Country:</b> {user.country}</div>}
          {user.product && <div><b>Account Type:</b> {user.product}</div>}
        </div>
        {/* Additional Info Form */}
        {/*
          === PROFILE FORM DIMENSIONS ===
          To adjust the width and padding of the form itself, edit width, maxWidth, and padding below.
        */}
        <form
          onSubmit={handleSave}
          style={{
            marginTop: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 2px 12px #bbb',
            width: '100%', // <-- Edit width for responsiveness
            maxWidth: 280, // <-- Edit maxWidth for desktop/mobile size
            minWidth: 0,
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={extra.firstName || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, borderRadius: 7, border: '1px solid #ccc', fontSize: 16, marginBottom: 8 }}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={extra.lastName || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, borderRadius: 7, border: '1px solid #ccc', fontSize: 16, marginBottom: 8 }}
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={extra.address || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, borderRadius: 7, border: '1px solid #ccc', fontSize: 16, marginBottom: 8 }}
          />
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#333', minWidth: 120 }}>Location Services:</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              {/*
                === LOCATION SERVICES SLIDER LENGTH ===
                To make the slider longer or shorter, edit the width value below (default: 74).
              */}
              <button
                type="button"
                onClick={handleLocationToggle}
                style={{
                  width: 64, // <-- Edit this value to make the slider longer or shorter
                  height: 28,
                  borderRadius: 16,
                  border: 'none',
                  background: locationEnabled ? '#2ecc40' : '#c82333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: locationEnabled ? 'flex-end' : 'flex-start',
                  padding: 3,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  position: 'relative',
                }}
                aria-label="Toggle Location Services"
              >
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'block',
                  transition: 'transform 0.2s',
                  boxShadow: '0 1px 4px #888',
                }} />
                <span style={{
                  position: 'absolute',
                  left: locationEnabled ? 8 : 14,
                  right: locationEnabled ? 14 : 8,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  pointerEvents: 'none',
                  top: 4,
                  textShadow: '0 1px 2px #0002',
                  transition: 'left 0.2s, right 0.2s',
                }}>
                  {locationEnabled ? 'On' : 'Off'}
                </span>
              </button>
            </div>
          </div>
          <button type="submit" style={{
            background: '#bbd0ff', // Matches hamburger menu button
            color: '#333', // Matches hamburger menu button text
            border: 'none',
            borderRadius: 7,
            padding: '10px 0',
            fontSize: 17,
            fontWeight: 600,
            marginTop: 8,
            cursor: 'pointer',
            width: '100%'
          }}>
            Save
          </button>
        </form>
      </div>
    </>
  );
};

export default Profile;
