import React, { useEffect, useState } from "react";
import "./UserPolls.css";
import PollCard from "./PollCard";
import { useLocation, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate"; 

const pollData = [
    {
      postId: "post_001",
      postBanned: false,
      postStatus: "active",
      question: "Should Aragon be used as a voting mechanism for EIP resolution?",
      options: [
        { label: "Yes", votes: 48 },
        { label: "Maybe", votes: 23 },
        { label: "No", votes: 4 },
        { label: "Not Sure", votes: 2 },
        { label: "Never heard of it", votes: 1 },
      ],
    },
    {
      postId: "post_002",
      postBanned: true,
      postStatus: "complete",
      question: "Is Ethereum Layer 2 scaling solving real-world bottlenecks?",
      options: [
        { label: "Absolutely", votes: 76 },
        { label: "Somewhat", votes: 14 },
        { label: "No", votes: 5 },
        { label: "Undecided", votes: 3 },
      ],
    },
    {
      postId: "post_003",
      postBanned: false,
      postStatus: "complete",
      question: "Should Solidity be replaced with a beginner-friendly language?",
      options: [
        { label: "Yes", votes: 32 },
        { label: "No", votes: 41 },
        { label: "Maybe", votes: 19 },
        { label: "I don’t know", votes: 8 },
      ],
    },
    {
      postId: "post_004",
      postBanned: false,
      postStatus: "active",
      question: "Are decentralized social platforms the future?",
      options: [
        { label: "Yes, 100%", votes: 55 },
        { label: "Possibly", votes: 28 },
        { label: "Doubtful", votes: 10 },
        { label: "No", votes: 4 },
        { label: "What’s that?", votes: 3 },
      ],
    },
    {
      postId: "post_005",
      postBanned: false,
      postStatus: "active",
      question: "Should smart contracts be audited by AI systems?",
      options: [
        { label: "Yes", votes: 60 },
        { label: "With human review", votes: 35 },
        { label: "No", votes: 7 },
      ],
    },
    {
      postId: "post_006",
      postBanned: true,
      postStatus: "banned",
      question: "Is proof-of-stake more secure than proof-of-work?",
      options: [
        { label: "Yes", votes: 50 },
        { label: "No", votes: 45 },
        { label: "Depends", votes: 20 },
      ],
    },
    {
      postId: "post_007",
      postBanned: false,
      postStatus: "complete",
      question: "Should DAOs replace traditional governance systems?",
      options: [
        { label: "In some cases", votes: 40 },
        { label: "Not yet", votes: 35 },
        { label: "Yes, fully", votes: 25 },
      ],
    },
    {
      postId: "post_008",
      postBanned: false,
      postStatus: "active",
      question: "Do blockchain certifications hold value in tech hiring?",
      options: [
        { label: "Yes", votes: 62 },
        { label: "No", votes: 21 },
        { label: "Depends on the cert", votes: 30 },
      ],
    },
    {
      postId: "post_009",
      postBanned: false,
      postStatus: "complete",
      question: "Should NFT royalties be enforced at the protocol level?",
      options: [
        { label: "Yes", votes: 58 },
        { label: "No", votes: 24 },
        { label: "Optional", votes: 15 },
      ],
    },
    {
      postId: "post_010",
      postBanned: false,
      postStatus: "active",
      question: "Is zk-rollup the best L2 scaling solution?",
      options: [
        { label: "Yes", votes: 67 },
        { label: "Still early", votes: 34 },
        { label: "Prefer optimistic rollups", votes: 29 },
        { label: "No idea", votes: 10 },
      ],
    },
  ];
  

const itemsPerPage = 6; 

const UserPolls = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state || {};

  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(0); 

  useEffect(() => {
    if (!location.state) {
      navigate("/admin");
    }
  }, [location, navigate]);

  const filteredPolls = pollData.filter((poll) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return poll.postStatus === "active";
    if (activeTab === "completed") return poll.postStatus === "complete";
    if (activeTab === "banned") return poll.postBanned === true;
    return true;
  });

  const totalPages = Math.ceil(filteredPolls.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const startOffset = currentPage * itemsPerPage;
  const currentPolls = filteredPolls.slice(startOffset, startOffset + itemsPerPage);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0); 
  };

  return (
    <div className="userpolls-container">
      <div className="user-header">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3607/3607444.png"
          alt="User Avatar"
          className="user-avatar-large"
        />
        <div className="user-info">
          <h2>{userData.name}</h2>
          <p>
            <strong>Email: </strong>
            {userData.email}
          </p>
          <div className="line-divider"></div>
          <p>
            <strong>Status:</strong>{" "}
            <span className="status-tag">{userData.status}</span>
          </p>
          <p>
            <strong>Date:</strong> 09/05/14
          </p>
        </div>
        <div className="user-score">
          <span className="total-polls-tag">{`Total Polls: ${userData.polls}`}</span>
          <button className="resume-btn">Freeze Account</button>
        </div>
      </div>

      <div className="user-tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => handleTabClick("all")}
        >
          All Polls
        </button>
        <button
          className={`tab ${activeTab === "active" ? "active" : ""}`}
          onClick={() => handleTabClick("active")}
        >
          Active Polls
        </button>
        <button
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => handleTabClick("completed")}
        >
          Completed Polls
        </button>
        <button
          className={`tab ${activeTab === "banned" ? "active" : ""}`}
          onClick={() => handleTabClick("banned")}
        >
          Banned Polls
        </button>
      </div>

      <div className="question-grid">
        {currentPolls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
          return (
            <PollCard
              key={poll.postId}
              question={poll.question}
              options={poll.options}
              totalVotes={totalVotes}
              postId={poll.postId}
              postBanned={poll.postBanned}
              postStatus={poll.postStatus}
            />
          );
        })}
      </div>

   
      <div className="pagination-wrapper">
        <ReactPaginate
          pageCount={totalPages}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
          previousLabel={"←"}
          nextLabel={"→"}
          pageRangeDisplayed={2}
          marginPagesDisplayed={1}
          breakLabel={"..."}
        />
      </div>
    </div>
  );
};

export default UserPolls;
