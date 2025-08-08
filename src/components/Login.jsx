import React, { useEffect } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./AuthStyles.css";
import picture from "../assets/spotify.png";
import video from  "../assets/LandingPage.mp4"

const Login = ({ setUser }) => {
  const { loginWithRedirect, isAuthenticated, user: auth0User } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const verifySessionAndSetUser = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const res = await axios.get("/auth/me");
          if (res.data.user) {
            setUser(res.data.user);
            navigate("/");
          } else {
            console.warn("No user returned from /auth/me");
          }
        } catch (error) {
          console.error(
            "Error verifying session:",
            error.response?.data || error.message
          );
        }
      }
    };
    verifySessionAndSetUser();
  }, [isAuthenticated, auth0User, setUser, navigate]);

  // ✅ Inline style for background video
  // const backgroundVideoStyle = {
  //   position: "fixed",
  //   top: 0,
  //   left: 0,
  //   minWidth: "100vw",
  //   minHeight: "100vh",
  //   objectFit: "cover",
  //   zIndex: -1,
  // };

  return (
    <div className="auth-container">
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          borderRadius: "10px",
          border: "2px solid #fff",
        }}
        // style={backgroundVideoStyle}
      >
        <source
          src={video}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      <h1>Discover What NYC is Vibing to!</h1>

      <div className="auth-form" style={{ textAlign: "center" }}>
        <h2>Login with Spotify</h2>

        {/* Replace button with clickable logo */}
        <img
          src={picture} // Update path if needed
          alt="Login with Spotify"
          onClick={() =>
            loginWithRedirect({
              authorizationParams: {
                prompt: "login",
              },
              connection: "spotify-custom",
              prompt: "consent",
              scope:
                "user-read-email user-read-private user-read-playback-state user-read-currently-playing offline_access",
            })
          }
          style={{
            marginTop: "20px",
            width: "80px", // Adjust size as needed
            height: "80px",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseOver={e => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>
    </div>
  );
};

export default Login;
