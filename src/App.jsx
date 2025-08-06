import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
// import axios from "axios";
import "./AppStyles.css";
import NavBar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
// import NowPlaying from "./components/Activelistener";
import ActliveListener from "./components/Activelistener";
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
  console.log("this is user--->", user)
  //const [token, setToken] = useState("");

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
    const syncSpotifyAndFetchUser = async () => {
      if (!isAuthenticated || !auth0User) {
        console.warn("User not authenticated or auth0User not ready.");
        return;
      }

      try {
        const claims = await getIdTokenClaims();
        const spotifyAccessToken = claims["https://localbeats.app/spotify_access_token"];

        if (!spotifyAccessToken) {
          console.warn("No Spotify access token found in ID token claims.");
          return;
        }

        //  Sync with backend — this will update DB & create session token
        await axios.post("/auth/spotify/sync", {}, {
          headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
          },
          withCredentials: true,
        }
        );


        // Fetch user info from DB (using session token)
        const res = await axios.get("/auth/me", { withCredentials: true });
        console.log("this is data-->", res.data)
        setUser(res.data.user);
      } catch (err) {
        console.error("Post-login sync failed:", err);
      }
    };

    // Update frontend state
    // setUser({
    //   name: auth0User.name,
    //   email: auth0User.email,
    //   picture: auth0User.picture,
    // });

    console.log("Auth0 state ->", { isAuthenticated, auth0User });
    syncSpotifyAndFetchUser();
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
          <Route path="/dashboard" element={
            <Dashboard user={user} />
          } />

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
