import React, { useEffect } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./AuthStyles.css";
import "./Login.css";

const Login = ({ setUser }) => {
  const { loginWithRedirect, isAuthenticated, user: auth0User } = useAuth0();
  const navigate = useNavigate();

  // Add login background class to body only on this page
  useEffect(() => {
    document.body.classList.add("login-bg");
    return () => {
      document.body.classList.remove("login-bg");
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
    <div className="auth-container login-landing-flex">
      {/* Overlayed white text, font size can be edited in Login.css under .spotify-login-text */}
      <div 
        className="spotify-login-text"
        style={{
          color: '#fff',
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          textAlign: 'center',
          zIndex: 2,
          // fontSize: '2.5rem', // Edit font size here or in Login.css
        }}
        onClick={() => loginWithRedirect({
          authorizationParams: {
            prompt: "login",
          },
          connection: "spotify-custom",
          prompt: "consent",
          scope: "user-read-email user-read-private user-read-playback-state user-read-currently-playing offline_access"
        })}
      >
        Login with Spotify
      </div>
      <button
        className="spotify-login-btn"
        style={{
          display: 'block',
          margin: '0 auto',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          zIndex: 2,
        }}
        onClick={() => loginWithRedirect({
          authorizationParams: {
            prompt: "login",
          },
          connection: "spotify-custom",
          prompt: "consent", // to force refresh token prompt
          scope: "user-read-email user-read-private user-read-playback-state user-read-currently-playing offline_access"
        })}
      >
        {/* Spotify logo image as button */}
        <img src={require("../assets/spotify-logo.png")} alt="Log in with Spotify" style={{ width: '90px', height: '90px' }} />
      </button>
    </div>
  );
};

export default Login;
