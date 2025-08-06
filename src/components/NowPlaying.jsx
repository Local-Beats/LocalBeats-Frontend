import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
// import { API_URL } from "../shared";

const NowPlaying = ({ user }) => {
  console.log("this is user from Nowplaying--->", user)
  const [track, setTrack] = useState(null);
  console.log("this is track", track)
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackFromBackend = async () => {
      try {
        // console.log(
        //   "Fetching current track from:",
        //   `${API_URL.trim()}/spotify/current-track`
        // );
        const response = await axios.get("/api/spotify/current-track",
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



  useEffect(() => {
    const createListeningSession = async () => {

      if (!user || !user.id) return;

      if (track) {
        const createListeningSession = await axios.post("/api/listeners",
          {
            status: "playing",
            user_id: user?.id,
            song_id: track.song_id,
            ended_at: null,
          },
          {
            withCredentials: true
          }

        );
      }
    }
    createListeningSession();
  }, [track?.song_id])

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
