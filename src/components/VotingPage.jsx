import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const VotingPage = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(false);

  const warningRef = useRef(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/polls/${pollId}`);
        setPoll(data);
        setRanking(data.options || []);
      } catch (err) {
        console.error("Fetch poll error:", err);
        setError("Failed to load poll.");
      }
    };

    fetchPoll();
  }, [pollId]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(ranking);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setRanking(items);
  };

  const isRankingComplete = () => {
    return ranking.length >= 2 && ranking.every((opt) => opt.id);
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (hasVoted || !poll) return;

    if (!isRankingComplete()) {
      setWarning(true);
      setTimeout(() => {
        warningRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    } else {
      setWarning(false);
    }

    try {
      const rankedOptionIds = ranking.map((opt) => opt.id);
      await axios.post(`${API_BASE}/api/ballots`, {
        pollId: poll.id,
        votes: rankedOptionIds,
      });

      setSubmitted(true);
      setHasVoted(true);
    } catch (err) {
      console.error("Vote submit error:", err);
      setError("Vote submission failed.");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !pollId) return;

    try {
      await axios.post(`${API_BASE}/api/subscribe-results`, {
        pollId,
        email,
      });
      setEmailSubmitted(true);
setTimeout(() => navigate("/dashboard"), 2000);   // This line was changed to go with the account page for now, can be renamed to dashboard later
    } catch (err) {
      console.error("Email submit error:", err);
      setError("Failed to save email.");
    }
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!poll) return <div className="loading">Loading poll...</div>;

  return (
    <div className="voting-page">
      <h2>{poll.title}</h2>
      <p>{poll.description}</p>
      <p>
        Ends: <strong>{poll.endTime}</strong>
      </p>
      <p>
        Total Votes: <strong>{poll.totalVotes}</strong>
      </p>

      {hasVoted && <div className="already-voted-msg">You've already voted.</div>}

      {warning && (
        <div className="vote-warning" ref={warningRef}>
          ⚠️ You have not ranked all options. You may still submit your vote.
        </div>
      )}

      {!submitted && (
        <form onSubmit={handleVoteSubmit}>
          <h3>Rank the options below (drag to reorder):</h3>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="options-list">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="options-list"
                >
                  {ranking.map((opt, index) => (
                    <Draggable
                      key={opt.id.toString()}
                      draggableId={opt.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          className="option-item"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {index + 1}. {opt.text}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          <button type="submit" className="submit-vote-btn" disabled={hasVoted}>
            Submit Vote
          </button>
        </form>
      )}

      {submitted && !emailSubmitted && (
        <form onSubmit={handleEmailSubmit} className="email-form">
          <label>
            Get notified when results are available:
            <input
              type="email"
              placeholder="Your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button type="submit">Submit Email</button>
        </form>
      )}

      {emailSubmitted && (
        <div className="email-confirmation">
          Email saved! You'll be notified when results are ready.
        </div>
      )}
    </div>
  );
};

export default VotingPage;
