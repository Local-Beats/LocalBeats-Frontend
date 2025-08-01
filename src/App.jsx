import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./AppStyles.css";
import NavBar from "./components/NavBar";
import NowPlaying from "./components/NowPlaying";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import CallBack from "./components/CallBack";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "./shared";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

// AUTH0 CONFIGURATION
const AUTH0_DOMAIN = "dev-m71z1z5w3vgzg8av.us.auth0.com";
const AUTH0_CLIENT_ID = "qhqEo3tGexhy8VRLbVR1OiSv2KGuadlh";

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const {
    isAuthenticated,
    user: auth0User,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
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
      if (isAuthenticated && auth0User) {
        try {
          const accessToken = await getAccessTokenSilently({
            audience: "https://api.spotify.com", // ✅ Ensure correct audience is passed
          });
          setToken(accessToken);

          // Decode the freshly received accessToken
          const decoded = jwtDecode(accessToken);
          const spotifyAccessToken =
            decoded["https://yourdomain.com/spotify_access_token"];
          console.log("Decoded Spotify Access Token:", spotifyAccessToken);

          // Send token to backend
          await axios.post(
            `${API_URL}/auth/auth0`,
            {
              auth0Id: auth0User.sub,
              email: auth0User.email,
              username: auth0User.nickname || auth0User.name,
              spotifyAccessToken,
            },
            { withCredentials: true }
          );

          setUser({
            name: auth0User.name,
            email: auth0User.email,
            picture: auth0User.picture,
          });
        } catch (err) {
          console.error("Failed to get access token:", err);
        }
      }
    };

    updateUserAndToken();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
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
          <Route path="/callback" element={<CallBack />} />
          <Route
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
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

// ✅ Root with Spotify audience + scopes
const Root = () => {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin + "/callback",
        audience: "https://api.spotify.com",
        scope: "user-read-email user-read-playback-state",
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
