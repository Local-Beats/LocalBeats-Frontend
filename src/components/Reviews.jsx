import React, { useState } from "react";
import "./ReviewsStyles.css";

const reviewsData = [
  {
    name: "Rachel Green",
    show: "Friends",
    comment: "Instapoll makes creating polls so easy and fun! Could I BE any happier?",
  },
  {
    name: "Jim Halpert",
    show: "The Office",
    comment: "Simple, clean, and reliable — finally a poll app that gets it right.",
  },
  {
    name: "Seong Gi-hun",
    show: "Squid Game",
    comment: "I survived the games, but Instapoll is the real winner for decision-making.",
  },
  {
    name: "Monica Geller",
    show: "Friends",
    comment: "As a perfectionist, I love how flawless and user-friendly this app is!",
  },
  {
    name: "Dwight Schrute",
    show: "The Office",
    comment: "Beets, bears, and Instapoll — the ultimate combo for team decisions.",
  },
  {
    name: "Kang Sae-byeok",
    show: "Squid Game",
    comment: "Fast and secure — just what I needed for quick group polls.",
  },
  {
    name: "Sheldon Cooper",
    show: "The Big Bang Theory",
    comment: "Statistically speaking, Instapoll has the highest efficiency-to-frustration ratio.",
  },
  {
    name: "Penny",
    show: "The Big Bang Theory",
    comment: "I don’t need to be a genius to know Instapoll totally rocks!",
  },
];


const Reviews = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
  <>
    <section className="how-it-works">
      <h2>How Instapoll Works</h2>
      <div className="steps">
        <div className="step">
          <h3>1. Create</h3>
          <p>Set up a question and add your options.</p>
        </div>
        <div className="step">
          <h3>2. Share</h3>
          <p>Send your poll via link or embed it anywhere.</p>
        </div>
        <div className="step">
          <h3>3. Decide</h3>
          <p>Watch the votes roll in and make the best choice.</p>
        </div>
      </div>
    </section>

    <section className="reviews">
      <h2>User Reviews</h2>
      <div className="reviews-container">
        {reviewsData.map(({ name, show, comment }, index) => (
          <div
            key={index}
            className={`review-card ${hoveredIndex === index ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="review-header">
              <strong>{name}</strong> <em>({show})</em>
            </div>
            <div className="stars-container">
              <div className="stars">★★★★★</div>
              {hoveredIndex === index && <div className="confetti"></div>}
            </div>
            <p className="review-comment">"{comment}"</p>
          </div>
        ))}
      </div>
    </section>
  </>
);
};


export default Reviews;
