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
      <h1 className="landing-title" style={{ color: '#fff' }}> Discover What NYC is Vibing too!</h1>
      <div className="auth-form" style={{ textAlign: "center" }}>
        <h2 className="landing-subtitle" style={{ color: '#fff' }}>Login with Spotify</h2>

        <button
          className="spotify-login-btn"
          onClick={() => loginWithRedirect({
            authorizationParams: {
              prompt: "login",
            },
            connection: "spotify-custom",
            prompt: "consent", // to force refresh token prompt
            scope: "user-read-email user-read-private user-read-playback-state user-read-currently-playing offline_access"
          })}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px 0",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={require("../assets/spotify-logo.png")} alt="Log in with Spotify" style={{ width: "60px", height: "60px" }} />
        </button>
      </div>
    </div>
  );
};

export default Login;
