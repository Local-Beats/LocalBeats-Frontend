import React, { useState, useEffect, useRef } from "react";
import axios from "../utils/axiosInstance";
import ListenerCard from "./ListenerCard";

const ActiveListener = ({ user }) => {
  console.log("this is user--->", user)
  // console.log("this is user from Nowplaying--->", user)
  const [track, setTrack] = useState(null);
  console.log("this is track--->", track)
  const [error, setError] = useState(null);

  const [activeSession, setActiveSession] = useState(null);
  // console.log("This is active session", activeSession)

  const [allListeningSessions, setAllListeningSessions] = useState([]);
  console.log("This is All Listening Sessions", allListeningSessions);

  const lastSongIdRef = useRef(null); // last seen song_id from polling
  const openSessionIdRef = useRef(null); // DB id of the currently-open session
  const isSyncingRef = useRef(false); // simple lock to prevent overlap
  let aliveRef = useRef(true);

  // oldSessionRef.current = null
  // console.log("this is old session ref--->", oldSessionRef.current)

  useEffect(() => {
    const fetchCurrentTrack = async () => {
      try {
        const { data } = await axios.get("/api/spotify/current-track")

        if (!aliveRef.current) return;

        // Only set track if data is valid and has a title
        if (data?.title) {
          // only change state of track if we get a new track
          if (data.song_id !== lastSongIdRef.current) {
            setTrack(data);
            lastSongIdRef.current = data.song_id;
          }
          setError(null);
        } else {
          // no song playing now
          if (lastSongIdRef.current !== null) {
            lastSongIdRef.current = null;
            setTrack(null);
          }
        }
      } catch (err) {
        if (!aliveRef.current) return;
        console.error("Error fetching current track:", err);
        setError("Unable to fetch currently playing track.");
      }
    };

    // Initial fetch + interval
    fetchCurrentTrack();
    const intervalId = setInterval(fetchCurrentTrack, 10000); // Refresh every 10s

    // Cleanup: stop interval
    return () => {
      aliveRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  // 
  // Sync a session whenever song_id OR user changes
  //   - If no track -> stop existing session (if any) and clear ref
  //   - If track   -> stop old (if any), then create a new session
  // 

  useEffect(() => {
    console.log("Entered useEffect for syncListeningSession")
    const syncListeningSession = async () => {
      // console.log("This is user ID --->", user.id)
      if (!user?.id) return;
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      try {
        // if there is no track playing stop and clear then leave and do nothing
        if (!track) {
          if (openSessionIdRef.current) {
            console.log("ending any pending session")
            await axios.patch(
              "/api/listeners",
              {
                id: openSessionIdRef.current,
                status: "stopped",
              },
              {
                withCredentials: true,
              }
            );
            openSessionIdRef.current = null;
            setActiveSession(null);
            isSyncingRef.current = false;
          }
          return;
        }

        // if track exist end old session first if any on memory
        if (openSessionIdRef.current) {
          console.log("found track closing old")
          await axios.patch(
            "/api/listeners",
            { status: "stopped", id: openSessionIdRef.current },
          );
        }

        // create a new session for this track
        const newListeningSession = await axios.post(
          "/api/listeners",
          {
            status: "playing",
            song_id: track.song_id,
            ended_at: null,
          },
        );

        setActiveSession(newListeningSession.data);
        openSessionIdRef.current = newListeningSession.data.id;
      } catch (error) {
        console.log(error?.response?.data || error.message || error);
      } finally {
        isSyncingRef.current = false;
      }
    };
    syncListeningSession();
  }, [track?.song_id, user?.id]);

  // end sessin on unmount
  useEffect(() => {
    return () => {
      if (openSessionIdRef.current) {
        axios
          .patch(
            "/api/listeners",
            { id: openSessionIdRef.current, status: "stopped" },
          )
          .catch(() => { });
      }
    };
  }, []);

  const fetchAllActiveListeners = React.useCallback(async () => {
    try {
      const res = await axios.get("/api/listeners", { withCredentials: true });
      // if (!aliveRef.current) return;

      setAllListeningSessions((prev) => {
        if (prev.length !== res.data.length) return res.data;
        const prevIds = prev
          .map((x) => x.id)
          .sort()
          .join(",");
        const nextIds = res.data
          .map((x) => x.id)
          .sort()
          .join(",");
        return prevIds === nextIds ? prev : res.data;
      });
    } catch (err) {
      console.error("Error fetching active listeners:", err);
    }
  }, []);

  //keeps others’ updates flowing in
  useEffect(() => {
    aliveRef.current = true;

    fetchAllActiveListeners(); // immediate
    const intervalId = setInterval(fetchAllActiveListeners, 8000);

    const onVisible = () => {
      if (document.visibilityState === "visible") fetchAllActiveListeners();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      aliveRef.current = false;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchAllActiveListeners]);

  //Instant refresh when change sessions
  useEffect(() => {
    if (!activeSession?.id) return;
    fetchAllActiveListeners();
  }, [activeSession?.id, fetchAllActiveListeners]);


  // if (error)
  //   return <p style={{ textAlign: "center", marginTop: "40px" }}>{error}</p>;
  // if (!track)
  //   return (
  //     <p style={{ textAlign: "center", marginTop: "40px" }}>
  //       No song is currently playing.
  //     </p>
  //   );

  return (
    <main>
      <h1>Active Listeners</h1>
      {/* Current user */}
      {/* <ListenerCard sessions={allListeningSessions} /> */}
      {/* Other active listeners */}
      <div className="active-listener-cards">
        {allListeningSessions?.map((session) => (
          <ListenerCard
            key={session.id}
            user={session.user}
            track={session.song}
          />
        ))}
      </div>
    </main>
  );
};

export default ActiveListener;
