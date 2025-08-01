import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./AppStyles.css";
import NavBar from "./components/NavBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import CallBack from "./components/CallBack";
import { API_URL } from "./shared";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

// Replace these with your Auth0 domain and client ID
const AUTH0_DOMAIN = "dev-m71z1z5w3vgzg8av.us.auth0.com";
const AUTH0_CLIENT_ID = "qhqEo3tGexhy8VRLbVR1OiSv2KGuadlh";

const App = () => {
  const [user, setUser] = useState(null);

  // Optionally integrate Auth0 user info if needed
  const { isAuthenticated, user: auth0User } = useAuth0();

  // Keep your backend auth check, but you can also sync Auth0 user info
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

  useEffect(() => {
    checkAuth();
  }, []);

  // You might want to sync Auth0 user info or decide how to unify auth here
  useEffect(() => {
    if (isAuthenticated && auth0User) {
      // Example: update your local user state from Auth0 profile
      setUser({
        name: auth0User.name,
        email: auth0User.email,
        picture: auth0User.picture,
      });
    }
  }, [isAuthenticated, auth0User]);

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
          {/* <Route exact path="/" element={<Home />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const Root = () => {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirectUri: window.location.origin + "/callback",
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



// test to help fix issues with merge