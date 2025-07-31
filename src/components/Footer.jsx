import React from "react";
import "./FooterStyles.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h4>Company</h4>
        <Link to="#" className="footer-link">About Us</Link>
        <Link to="#" className="footer-link">Careers</Link>
        <Link to="#" className="footer-link">Blog</Link>
      </div>

      <div className="footer-section">
        <h4>Support</h4>
        <Link to="#" className="footer-link">Help Center</Link>
        <Link to="#" className="footer-link">Contact Us</Link>
        <Link to="#" className="footer-link">Privacy Policy</Link>
      </div>

      <div className="footer-section">
        <h4>Social</h4>
        <Link to="#" className="footer-link">Instagram</Link>
        <Link to="#" className="footer-link">Facebook</Link>
        <Link to="#" className="footer-link">Twitter</Link>
        <Link to="#" className="footer-link">LinkedIn</Link>
      </div>

      <div className="footer-section">
        <h4>Share</h4>
        <Link to="#" className="footer-link">Invite Friends</Link>
        <Link to="#" className="footer-link">Share on Facebook</Link>
        <Link to="#" className="footer-link">Share on Twitter</Link>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Instapoll. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
