import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../shared";

const NowPlaying = () => {
  const [track, setTrack] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackFromBackend = async () => {
      try {
        const response = await axios.get(`${API_URL}/spotify/current-track`, {
          withCredentials: true,
        });

        setTrack(response.data);
      } catch (err) {
        setError("Unable to fetch currently playing track.");
        console.error(err);
      }
    };

    fetchTrackFromBackend();
    const interval = setInterval(fetchTrackFromBackend, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, []);

  if (error) return <p>{error}</p>;
  if (!track) return <p>No song is currently playing.</p>;

  return (
    <div className="now-playing" style={{ textAlign: "center", marginTop: "40px" }}>
      <img
        src={track.albumArt}
        alt={track.title}
        style={{ width: "200px", borderRadius: "12px" }}
      />
      <h2>{track.title}</h2>
      <p>
        {track.artist} — <em>{track.album}</em>
      </p>
    </div>
  );
};

export default NowPlaying;
