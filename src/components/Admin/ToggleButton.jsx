import React, { useState } from "react";
import "./ToggleButton.css";

const UserActionButton = ({ initialStatus }) => {
  const [status, setStatus] = useState(initialStatus.toLowerCase() || "active");

  const handleToggle = () => {
    setStatus((prev) => (prev === "active" ? "suspended" : "active"));
    
  };

  const isSuspended = status === "suspended";

  return (
    <button
      className={`user-action-button ${isSuspended ? "suspended" : "active"}`}
      onClick={handleToggle}
    >
      {isSuspended ? "Reactivate User" : "Suspend User"}
    </button>
  );
};

export default UserActionButton;
