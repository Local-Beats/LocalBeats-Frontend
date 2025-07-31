import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../shared";
import { useAuth0 } from "@auth0/auth0-react";
import "./AuthFormStyles.css";

// Background SVG pattern encoded as URL string (same as in your app)
const backgroundPatternUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='100' viewBox='0 0 600 100'%3E%3Crect fill='%23ffffff' width='600' height='100'/%3E%3Cg stroke='%23FFF' stroke-width='0' stroke-miterlimit='10'%3E%3Ccircle fill='%23037B79' cx='0' cy='0' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='100' cy='0' r='50'/%3E%3Ccircle fill='%23FFFFD8' cx='200' cy='0' r='50'/%3E%3Ccircle fill='%23CAF2FF' cx='300' cy='0' r='50'/%3E%3Ccircle fill='%236FCCFF' cx='400' cy='0' r='50'/%3E%3Ccircle fill='%23006EB4' cx='500' cy='0' r='50'/%3E%3Ccircle fill='%23037B79' cx='600' cy='0' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='-50' cy='50' r='50'/%3E%3Ccircle fill='%2353AC9A' cx='50' cy='50' r='50'/%3E%3Ccircle fill='%23CEEDC1' cx='150' cy='50' r='50'/%3E%3Ccircle fill='%23FFFFFF' cx='250' cy='50' r='50'/%3E%3Ccircle fill='%239DE0FE' cx='350' cy='50' r='50'/%3E%3Ccircle fill='%233E9CDA' cx='450' cy='50' r='50'/%3E%3Ccircle fill='%2300789C' cx='550' cy='50' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='650' cy='50' r='50'/%3E%3Ccircle fill='%23037B79' cx='0' cy='100' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='100' cy='100' r='50'/%3E%3Ccircle fill='%23FFFFD8' cx='200' cy='100' r='50'/%3E%3Ccircle fill='%23CAF2FF' cx='300' cy='100' r='50'/%3E%3Ccircle fill='%236FCCFF' cx='400' cy='100' r='50'/%3E%3Ccircle fill='%23006EB4' cx='500' cy='100' r='50'/%3E%3Ccircle fill='%23037B79' cx='600' cy='100' r='50'/%3E%3Ccircle fill='%23CAF2FF' cx='50' cy='150' r='50'/%3E%3Ccircle fill='%236FCCFF' cx='150' cy='150' r='50'/%3E%3Ccircle fill='%239DE0FE' cx='250' cy='150' r='50'/%3E%3Ccircle fill='%2353AC9A' cx='350' cy='150' r='50'/%3E%3Ccircle fill='%23CEEDC1' cx='450' cy='150' r='50'/%3E%3Ccircle fill='%23FFFFD8' cx='550' cy='150' r='50'/%3E%3C/g%3E%3C/svg%3E`;

const AuthForm = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode based on URL pathname
  const getModeFromPath = () => {
    if (location.pathname === "/signup") return "signup";
    // default to login for any other path including "/login"
    return "login";
  };

  const [mode, setMode] = useState(getModeFromPath());

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [signupLoading, setSignupLoading] = useState(false);

  const {
    loginWithRedirect,
    isLoading: auth0Loading,
    error: auth0Error,
  } = useAuth0();

  useEffect(() => {
    setMode(getModeFromPath());
  }, [location.pathname]);

  // Apply background pattern on mount, clean up on unmount
  useEffect(() => {
    document.body.style.setProperty("--bg-pattern", `url("${backgroundPatternUrl}")`);

    return () => {
      document.body.style.removeProperty("--bg-pattern");
    };
  }, []);

  // (Validation and handlers remain unchanged)
  const validateLogin = () => {
    const errors = {};
    if (!loginData.username) errors.username = "Username is required";
    if (!loginData.password) errors.password = "Password is required";
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignup = () => {
    const errors = {};
    if (!signupData.username) {
      errors.username = "Username is required";
    } else if (signupData.username.length < 3 || signupData.username.length > 20) {
      errors.username = "Username must be between 3 and 20 characters";
    }
    if (!signupData.password) {
      errors.password = "Password is required";
    } else if (signupData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!signupData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (loginErrors[name]) {
      setLoginErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    if (signupErrors[name]) {
      setSignupErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoginLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginData, {
        withCredentials: true,
      });
      setUser(response.data.user);
      navigate("/");
    } catch (error) {
      setLoginErrors({
        general:
          error.response?.data?.error || "An error occurred during login",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setSignupLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/signup`,
        {
          username: signupData.username,
          password: signupData.password,
        },
        { withCredentials: true }
      );
      setUser(response.data.user);
      navigate("/");
    } catch (error) {
      setSignupErrors({
        general:
          error.response?.data?.error || "An error occurred during signup",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  const handleAuth0Login = () => loginWithRedirect();
  const switchToSignUp = () => navigate("/signup");
  const switchToSignIn = () => navigate("/login");

  return (
    <div className="auth-wrapper">
      <div
        className={
          mode === "signup" ? "container right-panel-active" : "container"
        }
        id="container"
      >
        {/* SIGN UP FORM */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignupSubmit}>
            <h1>Create Account</h1>
            {signupErrors.general && (
              <div className="error-message">{signupErrors.general}</div>
            )}
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={signupData.username}
              onChange={handleSignupChange}
              className={signupErrors.username ? "error" : ""}
              autoComplete="username"
            />
            {signupErrors.username && (
              <span className="error-text">{signupErrors.username}</span>
            )}
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={signupData.password}
              onChange={handleSignupChange}
              className={signupErrors.password ? "error" : ""}
              autoComplete="new-password"
            />
            {signupErrors.password && (
              <span className="error-text">{signupErrors.password}</span>
            )}
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              className={signupErrors.confirmPassword ? "error" : ""}
              autoComplete="new-password"
            />
            {signupErrors.confirmPassword && (
              <span className="error-text">
                {signupErrors.confirmPassword}
              </span>
            )}
            <button type="submit" disabled={signupLoading}>
              {signupLoading ? "Creating account..." : "Sign Up"}
            </button>
            <hr className="divider" />
            <div className="auth0-login">
              <p>Or sign up with:</p>
              {auth0Error && (
                <div className="error-message">
                  Auth0 Error: {auth0Error.message}
                </div>
              )}
              <button
                onClick={handleAuth0Login}
                className="auth0-button"
                disabled={auth0Loading}
                type="button"
              >
                {auth0Loading ? "Redirecting..." : "Sign Up with Auth0"}
              </button>
            </div>
            <p className="auth-link">
              Already have an account?{" "}
              <button
                type="button"
                className="ghost"
                onClick={switchToSignIn}
                style={{
                  background: "none",
                  border: "none",
                  color: "#333",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </p>
          </form>
        </div>

        {/* LOGIN FORM */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign in</h1>
            {loginErrors.general && (
              <div className="error-message">{loginErrors.general}</div>
            )}
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={loginData.username}
              onChange={handleLoginChange}
              className={loginErrors.username ? "error" : ""}
              autoComplete="username"
            />
            {loginErrors.username && (
              <span className="error-text">{loginErrors.username}</span>
            )}
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              className={loginErrors.password ? "error" : ""}
              autoComplete="current-password"
            />
            {loginErrors.password && (
              <span className="error-text">{loginErrors.password}</span>
            )}
            <button type="submit" disabled={loginLoading}>
              {loginLoading ? "Logging in..." : "Login"}
            </button>
            <hr className="divider" />
            <div className="auth0-login">
              <p>Or log in with:</p>
              {auth0Error && (
                <div className="error-message">
                  Auth0 Error: {auth0Error.message}
                </div>
              )}
              <button
                onClick={handleAuth0Login}
                className="auth0-button"
                disabled={auth0Loading}
                type="button"
              >
                {auth0Loading ? "Redirecting..." : "Login with Auth0"}
              </button>
            </div>
            <p className="auth-link">
              Don’t have an account?{" "}
              <button
                type="button"
                className="ghost"
                onClick={switchToSignUp}
                style={{
                  background: "none",
                  border: "none",
                  color: "#333",
                  cursor: "pointer",
                }}
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>

        {/* OVERLAY PANELS */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={switchToSignIn} id="signIn">
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" onClick={switchToSignUp} id="signUp">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
