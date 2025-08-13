import React, { useEffect } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./AuthStyles.css";
import "./LandingPage.css";

const LandingPage = ({ setUser }) => {
  const { loginWithRedirect, isAuthenticated, user: auth0User } = useAuth0();
  const navigate = useNavigate();

  // Set amy-background2.png as background only on this page
  useEffect(() => {
    const originalBg = document.body.style.background;
    document.body.style.background = `url(${require("../assets/amy-background2.png")}) no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    return () => {
      document.body.style.background = originalBg;
      document.body.style.backgroundSize = "";
      document.body.style.backgroundAttachment = "";
    };
  }, []);

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
          console.error("Error verifying session:", error.response?.data || error.message);
        }
      }
    };
    verifySessionAndSetUser();
  }, [isAuthenticated, auth0User, setUser, navigate]);

  return (
    <div className="landing-spotify-container">
      <img
        src={require("../assets/LocalBeats.png")}
        alt="LocalBeats Logo"
        className="localbeats-main-logo"
      />
      <div className="landing-headline">Discover What NYC is Vibing To!</div>
      <div className="login-title">Login with Spotify</div>
      <button
        className="spotify-logo-btn"
        onClick={() => loginWithRedirect({
          authorizationParams: {
            prompt: "login",
          },
          connection: "spotify-custom",
          prompt: "consent",
          scope: "user-read-email user-read-private user-read-playback-state user-read-currently-playing offline_access"
        })}
        aria-label="Login with Spotify"
      >
        <img
          src={require("../assets/spotify-logo.png")}
          alt="Log in with Spotify"
          className="spotify-logo-img"
        />
      </button>
    </div>
  );
};

export default LandingPage;
