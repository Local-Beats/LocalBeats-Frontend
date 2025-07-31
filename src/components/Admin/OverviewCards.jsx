import React from "react";
import "./OverviewCards.css";

const OverviewCards = () => {
  const cards = [
    { title: "Total Users", value: 132, sub: "2 Completed" },
    { title: "Banned Users", value: 13, sub: "28 Completed" },
    { title: "Total Polls", value: 1200, sub: "1 Completed" },
    { title: "Frozen Polls", value: 10, sub: "5% Completed" },
  ];

  return (
    <div className="overview-cards">
      <div className="card-header">
        <h2>Admin Dashboard</h2>
        <div className="create-project-btn">New</div>
      </div>

      <div className="card-container">
        {cards.map((card, idx) => (
          <div key={idx} className="card">
            <div className="card-title">{card.title}</div>
            <div className="card-value">{card.value}</div>
            <div className="card-sub">{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewCards;
