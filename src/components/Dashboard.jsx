import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./DashboardStyles.css";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../shared";
import { ThemeContext } from "./ThemeContext";

// Same background pattern URL as Home.jsx
const backgroundPatternUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='100' viewBox='0 0 600 100'%3E%3Crect fill='%23ffffff' width='600' height='100'/%3E%3Cg stroke='%23FFF' stroke-width='0' stroke-miterlimit='10'%3E%3Ccircle fill='%23037B79' cx='0' cy='0' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='100' cy='0' r='50'/%3E%3Ccircle fill='%23FFFFD8' cx='200' cy='0' r='50'/%3E%3Ccircle fill='%23CAF2FF' cx='300' cy='0' r='50'/%3E%3Ccircle fill='%236FCCFF' cx='400' cy='0' r='50'/%3E%3Ccircle fill='%23006EB4' cx='500' cy='0' r='50'/%3E%3Ccircle fill='%23037B79' cx='600' cy='0' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='-50' cy='50' r='50'/%3E%3Ccircle fill='%2353AC9A' cx='50' cy='50' r='50'/%3E%3Ccircle fill='%23CEEDC1' cx='150' cy='50' r='50'/%3E%3Ccircle fill='%23FFFFFF' cx='250' cy='50' r='50'/%3E%3Ccircle fill='%239DE0FE' cx='350' cy='50' r='50'/%3E%3Ccircle fill='%233E9CDA' cx='450' cy='50' r='50'/%3E%3Ccircle fill='%2300789C' cx='550' cy='50' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='650' cy='50' r='50'/%3E%3Ccircle fill='%23037B79' cx='0' cy='100' r='50'/%3E%3Ccircle fill='%2392DEBA' cx='100' cy='100' r='50'/%3E%3Ccircle fill='%23FFFFD8' cx='200' cy='100' r='50'/%3E%3Ccircle fill='%23CAF2FF' cx='300' cy='100' r='50'/%3E%3Ccircle fill='%236FCCFF' cx='400' cy='100' r='50'/%3E%3Ccircle fill='%23006EB4' cx='500' cy='100' r='50'/%3E%3Ccircle fill='%23037B79' cx='600' cy='100' r='50'/%3E%3Ccircle fill='%23CAF2FF' cx='50' cy='150' r='50'/%3E%3Ccircle fill='%236FCCFF' cx='150' cy='150' r='50'/%3E%3Ccircle fill='%239DE0FE' cx='250' cy='150' r='50'/%3E%3Ccircle fill='%2353AC9A' cx='350' cy='150' r='50'/%3E%3Ccircle fill='%23CEEDC1' cx='450' cy='150' r='50'/%3E%3Ccircle fill='%23FFFFD8' cx='550' cy='150' r='50'/%3E%3C/g%3E%3C/svg%3E`;

const Dashboard = () => {
  const [polls, setPolls] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  // Set background pattern and theme class on body
  useEffect(() => {
    document.body.style.setProperty("--bg-pattern", `url("${backgroundPatternUrl}")`);
    document.body.classList.add(theme);
    return () => {
      document.body.style.removeProperty("--bg-pattern");
      document.body.classList.remove(theme);
    };
  }, [theme]);

  // Fetch polls from API
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get(`${API_URL}/polls/my`, { withCredentials: true });
        setPolls(res.data.polls);
      } catch (err) {
        console.error("Failed to load polls", err);
      }
    };
    fetchPolls();
  }, []);

  // Filter polls by status and title
  const filteredPolls = polls.filter((poll) => {
    const titleMatch = poll.title.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === "all" || poll.status === statusFilter;
    return titleMatch && statusMatch;
  });

  // Delete poll
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this draft poll?")) {
      try {
        await axios.delete(`${API_URL}/polls/${id}`, { withCredentials: true });
        setPolls((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Failed to delete poll", err);
      }
    }
  };

  // Copy poll link
  const handleCopyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/polls/${id}`);
    alert("Link copied!");
  };

  return (
    <div className="account-container">
      <h2>📋 My Polls</h2>
      {/* Search/filter UI */}
      <input
        type="text"
        placeholder="Search by title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
        <option value="all">All</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="ended">Ended</option>
      </select>
      {/* Create poll button */}
      <button
        type="button"
        onClick={() => navigate("/create")}
        style={{ marginLeft: "1em" }}
      >
        Create a New Poll ＋
      </button>
      {/* List of filtered polls with emoji status and actions */}
      <ul>
        {filteredPolls.map((poll) => (
          <li key={poll.id}>
            <span>
              <Link to={`/polls/${poll.id}`}>{poll.title}</Link>{" "}
              <span style={{ fontWeight: "bold" }}>
                {poll.status === "draft" && "📝"}
                {poll.status === "published" && "✅"}
                {poll.status === "ended" && "⏰"}
                {poll.status}
              </span>
            </span>
            {/* Actions for each poll */}
            {poll.status === "draft" && (
              <>
                <button onClick={() => handleDelete(poll.id)}>🗑️ Delete</button>
                <Link to={`/edit/${poll.id}`}>✏️ Edit</Link>
              </>
            )}
            {poll.status === "published" && (
              <>
                <button onClick={() => handleCopyLink(poll.id)}>📋 Copy Link</button>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    `${window.location.origin}/polls/${poll.id}`
                  )}&text=Check out this poll!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: "8px" }}
                >
                  🐦 Share on Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    `${window.location.origin}/polls/${poll.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: "8px" }}
                >
                  📘 Share on Facebook
                </a>
              </>
            )}
            {/* Poll duplication logic */}
            <button
              onClick={async () => {
                try {
                  const res = await axios.post(`${API_URL}/polls/${poll.id}/duplicate`, {}, {
                    withCredentials: true,
                  });
                  alert("Poll duplicated!");
                  navigate(`/edit/${res.data.poll.id}`);
                } catch (err) {
                  console.error("Duplication failed:", err);
                  alert("Could not duplicate poll.");
                }
              }}
              style={{ marginLeft: "8px" }}
            >
              📄 Duplicate
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
