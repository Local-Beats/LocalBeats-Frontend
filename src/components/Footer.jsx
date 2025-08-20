import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} LocalBeats. All rights reserved.</p>
      <p>
        <Link to="/privacy" className="footer-link">
          Privacy
        </Link>
        {" "} | {" "}
        <Link to="/terms" className="footer-link">
          Terms
        </Link>
        {" "} | {" "}
        <Link to="/contact" className="footer-link">
          Contact
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
