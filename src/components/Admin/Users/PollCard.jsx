import React from "react";
import "./PollCard.css";

const PollCard = ({ question, options, totalVotes, postId, postBanned, postStatus }) => {

    const capitalizeFirstLetter = (str) => {
        if (!str) return ""; 
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
  return (
    <div className="poll-card">
      <div className="poll-header">
        <span className={`status-badge-${postStatus}`}>{capitalizeFirstLetter(postStatus)}</span>
        {postBanned && (
            <span className="status-badge-banned">Frozen</span>
        )}
      </div>

      <p className="poll-question">{question}</p>

      <div className="poll-options">
        {options.slice(0, 3).map((option, index) => {
          const percentage = Math.round((option.votes / totalVotes) * 100);
          return (
            <div key={index} className="poll-option">
              <div className="option-label">
                <span>{option.label}</span>
                <span className="percentage-text">{percentage}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
        {/* {options.length > 3 && (
          <button className="more-button">+{options.length - 3} more</button>
        )} */}
      </div>

      <div className="poll-actions">
        {postStatus === "complete" ? (
            <button className="view-details">View Results</button>
        ) : <></>
        }
        {!postBanned ? (
            <button className="ban-button">Freeze Post</button>
        ) : (
            <button className="unban-post-btn">Unfreeze</button>
        )}
    </div>

    </div>
  );
};

export default PollCard;
