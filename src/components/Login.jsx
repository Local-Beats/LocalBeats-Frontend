import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./AuthStyles.css";

const Login = ({ setUser }) => {
  const { loginWithRedirect, isAuthenticated, user: auth0User } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      setUser({
        name: auth0User.name,
        email: auth0User.email,
        picture: auth0User.picture,
      });
      navigate("/");
    }
  }, [isAuthenticated, auth0User, setUser, navigate]);

  return (
    <div className="auth-container">
      <h1> Discover What NYC is Vibing to!</h1>
      <div className="auth-form" style={{ textAlign: "center" }}>
        <h2>Login with Spotify</h2>

        <button
          onClick={() => loginWithRedirect({ connection: "spotify" })}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px 0",
            backgroundColor: "#1DB954",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Log in with Spotify
        </button>
      </div>
    </div>
  );
};

export default Login;
