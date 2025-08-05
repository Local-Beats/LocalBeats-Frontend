import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../shared";

const NowPlaying = () => {
  const [track, setTrack] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackFromBackend = async () => {
      try {
        console.log(
          "Fetching current track from:",
          `${API_URL.trim()}/spotify/current-track`
        );
        const response = await axios.get(
          `${API_URL.trim()}/spotify/current-track`,
          {
            withCredentials: true,
          }
        );

        const data = response.data;

        // Only set track if data is valid and has a title
        if (data && data.title) {
          setTrack(data);
          setError(null);
        } else {
          setTrack(null);
        }
      } catch (err) {
        console.error("Error fetching current track:", err);
        setError("Unable to fetch currently playing track.");
      }
    };

    fetchTrackFromBackend();
    const interval = setInterval(fetchTrackFromBackend, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, []);

  if (error)
    return <p style={{ textAlign: "center", marginTop: "40px" }}>{error}</p>;
  if (!track)
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        No song is currently playing.
      </p>
    );

  return (
    <div
      className="now-playing"
      style={{ textAlign: "center", marginTop: "40px" }}
    >
      <img
        src={track.albumArt}
        alt={track.title}
        style={{ width: "200px", borderRadius: "12px" }}
      />
      <h2>{track.title}</h2>
      <p>
        {track.artist}
        {track.albumArt && track.album ? (
          <>
            {" "}
            — <em>{track.album}</em>
          </>
        ) : null}
      </p>
    </div>
  );
};

export default NowPlaying;
