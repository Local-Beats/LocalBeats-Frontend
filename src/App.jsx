import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
// import axios from "axios";
import "./AppStyles.css";
import NavBar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
// import NowPlaying from "./components/NowPlaying";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
// import Home from "./components/Home";
import NotFound from "./components/NotFound";
// import CallBack from "./components/CallBack";
// import { jwtDecode } from "jwt-decode";
// import { API_URL } from "./shared";
import axios from './utils/axiosInstance';
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

// AUTH0 CONFIGURATION
const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID;

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const {
    isAuthenticated,
    user: auth0User,
    getIdTokenClaims,
  } = useAuth0(); // swapped getAccessTokenSilently for getIdTokenClaims

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/auth/me", {
          withCredentials: true,
        });
        setUser(response.data.user);
      } catch {
        console.log("Not authenticated");
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const updateUserAndToken = async () => {
      if (!isAuthenticated || !auth0User) {
        console.warn("User not authenticated or auth0User not ready.");
        return;
      }

      try {
        // const claims = await getIdTokenClaims();
        // console.log("✅ Full ID token claims:", claims);

        // const spotifyAccessToken = claims["https://localbeats.app/spotify_access_token"];

        // if (!claims["https://localbeats.app/spotify_access_token"]) {
        //   console.warn("⚠️ PostLogin Action ran, but no access token was set.");
        // }

        // if (!spotifyAccessToken) {
        //   console.warn("⚠️ No Spotify access token found in ID token.");
        //   return;
        // }

        // console.log("🎧 Sending token to backend for sync...");
        const claims = await getIdTokenClaims();
        const idToken = claims.__raw
        // ✅ Sync user using backend route that calls Spotify API
        await axios.post(
          "/auth/spotify/sync",
          {},
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            withCredentials: true,
          }
        );

        // ✅ Update frontend state
        setUser({
          name: auth0User.name,
          email: auth0User.email,
          picture: auth0User.picture,
        });
      } catch (err) {
        console.error("❌ Error during post-login sync:", err);
      }
    };

    console.log("Auth0 state ->", { isAuthenticated, auth0User });
    updateUserAndToken();
  }, [isAuthenticated, auth0User, getIdTokenClaims]);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      <NavBar user={user} onLogout={handleLogout} />
      <div className="app">
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/callback" element={<CallBack />} /> */}
          {/* <Route
            exact
            path="/"
            element={
              <div>
                <Home />
                {isAuthenticated && token && (
                  <>
                    <div
                      className="access-token-display"
                      style={{ margin: "20px 0" }}
                    >
                      <h3>Access Token:</h3>
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {token}
                      </pre>
                    </div>

                    <NowPlaying accessToken={token} />
                  </>
                )}
              </div>
            }
          /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

// ✅ Root with Spotify audience + scopes
const Root = () => {
  return (
    // <Auth0Provider
    //   domain={AUTH0_DOMAIN}
    //   clientId={AUTH0_CLIENT_ID}
    //   authorizationParams={{
    //     redirect_uri: window.location.origin + "/callback",
    //     audience: "https://api.spotify.com",
    //     scope: "user-read-email user-read-private user-read-playback-state user-read-currently-playing offline_access",
    //   }}
    //   cacheLocation="localstorage"
    // >
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin + "/dashboard"
      }}
      cacheLocation="localstorage"
    >
      <Router>
        <App />
      </Router>
    </Auth0Provider>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<Root />);
