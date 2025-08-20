// Unregister service worker in development to avoid caching/flicker issues
if (process.env.NODE_ENV !== "production" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
// import axios from "axios";
import "./AppStyles.css";
// import NavBar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Favorites from "./components/Favorites";
// import NowPlaying from "./components/Activelistener";
// import ActliveListener from "./components/Activelistener";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Signup from "./components/Signup";
// import Home from "./components/Home";
import NotFound from "./components/NotFound";
// import { jwtDecode } from "jwt-decode";
// import { API_URL } from "./shared";
import axios from './utils/axiosInstance';
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
//test

// 💥 DEV-ONLY: Unregister service workers + clear caches
if (process.env.NODE_ENV !== "production" && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      reg.unregister().then(() => {
        console.log("🧹 Unregistered SW");
      });
    }
  });
  caches.keys().then((keys) => {
    keys.forEach((key) => caches.delete(key));
    console.log("🧹 Cleared caches");
  });
}

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
      try {
        const claims = await getIdTokenClaims();
        const spotifyAccessToken = claims["https://localbeats.app/spotify_access_token"];

        if (!spotifyAccessToken) {
          console.warn("No Spotify access token found in ID token claims.");
          return;
        }

        await axios.post("/auth/spotify/sync", {}, {
          headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
          },
          withCredentials: true,
        });

        let res;
        try {
          res = await axios.get("/auth/me", { withCredentials: true });
          setUser(res.data.user);
        } catch (err) {
          console.warn("First /auth/me failed — retrying in 500ms...");
          setTimeout(async () => {
            try {
              const retryRes = await axios.get("/auth/me", { withCredentials: true });
              setUser(retryRes.data.user);
            } catch (retryErr) {
              console.error("Retry failed. Still not logged in.", retryErr);
            }
          }, 500);
        }
      } catch (err) {
        console.error("Post-login sync failed:", err);
      }
    };

    if (
      isAuthenticated &&
      auth0User &&
      user === null // <- only sync if user hasn't been set yet
    ) {
      console.log("Syncing Auth0 → DB user...");
      syncSpotifyAndFetchUser();
    }
  }, [isAuthenticated, auth0User, getIdTokenClaims, user]);


  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true });
      setUser(null);
      // Redirect to Auth0 logout, which will also redirect to your landing page
      window.location.href = `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(window.location.origin + "/")}`;
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    // Prompt for location on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => { },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert("Location permission is required for full functionality.");
          }
        }
      );
    }
  }, []);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;
    if (isIos && !isInStandaloneMode) {
      // Show your custom "Add to Home Screen" instructions
      // e.g., set state to show a modal/banner
    }
  }, []);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/dashboard" element={
          user === null ? (
            <div style={{ textAlign: "center", marginTop: 60 }}>
              {isAuthenticated ? "Loading your profile..." : "Please log in first."}
            </div>
          ) : (
            <Dashboard user={user} onLogout={handleLogout} />
          )
        } />
        <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} />} />
        <Route path="/favorites" element={<Favorites user={user} onLogout={handleLogout} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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

if (process.env.NODE_ENV !== "production" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
