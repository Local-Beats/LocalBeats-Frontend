import React from "react";

function ResultOption({ option, percentage }) {
  console.log(option);
  const { title, color, votes } = option;
  return (
    <div className="poll-option" key={title}>
      <div className="poll-label">
        <span>{title}</span>
        <span>{percentage}%</span>
      </div>
      <div className="poll-bar-background">
        <div
          className="poll-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
      <p className="poll-votes">{votes} Votes</p>
    </div>
  );
}

export default ResultOption;
