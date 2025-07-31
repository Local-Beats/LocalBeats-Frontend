import React from "react";
import "./Results.css";
import ResultOption from "./ResultOption";
import PieChartResult from "./PieChartResult";

const pollData = [
  { title: "Photoshop", votes: 8, color: "#f87171" },
  { title: "Sketch", votes: 85, color: "#4ade80" },
  { title: "Adobe XD", votes: 4, color: "#facc15" },
  { title: "Figma", votes: 58, color: "#60a5fa" },
];

const PollApp = () => {
  const totalVotes = pollData.reduce((sum, item) => sum + item.votes, 0);

  return (
    <div className="poll-container">
        <p className="poll-category">Open</p>
        <h1 className="poll-question">What design tool do you use the most?</h1>
        <p className="poll-meta">Asked by anonymous about 3 hours ago</p>
      <div className="poll-box">

        <div className="poll-graph">
          <PieChartResult pollData={pollData}/>
        </div>
        
        <div className="poll-options">
        {pollData.map((option, idx) => {
          const percentage = ((option.votes / totalVotes) * 100).toFixed(0);
          return (
            <ResultOption option={option} percentage={percentage} key={idx} />
          );
        })}
        </div>

        <div className="poll-actions">
        <button className="poll-button">Submit your vote</button>

        <div className="poll-stats">
          <div className="poll-total">
            <p className="poll-total-header">Votes</p>
            <p className="poll-total-number">{totalVotes}</p>
          </div>

          <div className="grey-line"></div>

          <div className="poll-share">
            <p>Share</p>
            {/* <a href="#">Twitter</a>
            <a href="#">Facebook</a> */}
            <a onClick={() => navigator.clipboard.writeText(location.href)}>Copy Link</a>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PollApp;
