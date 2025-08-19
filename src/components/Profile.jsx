import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

const Profile = ({ user, onLogout }) => {
  const navigate = useNavigate();
  if (!user) return <div style={{ padding: 32 }}>You must be logged in to view your profile.</div>;
  const profilePicUrl = user.spotify_image || user.picture || (user.images && user.images[0] && user.images[0].url);
  return (
    <>
      <NavBar user={user} onLogout={onLogout || (() => {})} />
      <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, borderRadius: 12, boxShadow: "0 2px 12px #bbb", background: "#fff" }}>
        <img
          src={profilePicUrl}
          alt="Profile"
          style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", marginBottom: 16, display: "block", marginLeft: "auto", marginRight: "auto" }}
        />
        <h2 style={{ textAlign: "center", marginBottom: 8 }}>{user.spotify_display_name || user.display_name || user.nickname}</h2>
        <div style={{ textAlign: "center", color: "#666", marginBottom: 16 }}>{user.email}</div>
        <div style={{ textAlign: "center", color: "#888" }}>
          <div><b>Spotify ID:</b> {user.spotify_id || user.id}</div>
          {user.country && <div><b>Country:</b> {user.country}</div>}
          {user.product && <div><b>Account Type:</b> {user.product}</div>}
        </div>
      </div>
    </>
  );
};

export default Profile;
