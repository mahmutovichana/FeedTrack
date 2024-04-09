import { useEffect, useState } from "react";
import "./../../styles/UserPanel/feedbackUserInput.css";
import feedtrackLogo from "./../../assets/feedtrackLogoBlack.svg";
import { deployURLs } from "../../../public/constants";

const UserFeedbackInput = () => {
  const [satisfactionLevel, setSatisfactionLevel] = useState(null);
  const [hidden, setHidden] = useState(true);

  const handleSmileyClick = (level) => {
    setSatisfactionLevel(level);
  };

  useEffect(() => {
    const welcomeMessage = fetch(`${deployURLs.backendURL}/api/welcomeData`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${localStorage.token}`,
      },
    });
  }, []);

  const sendFeedback = async () => {
    if (satisfactionLevel !== null) {
      // Sending feedback to the server
      console.log("Feedback sent successfully:", satisfactionLevel);
    } else {
      alert("Please select a satisfaction level");
      console.log("Please select a satisfaction level.");
    }
  };

  return (
    <div className="feedbackUserInputContainer">
      <div className="container">
        <div className="logo">
          <img
            src={`${deployURLs.backendURL}/api/welcomeData/welcome-image.png`}
            className="logo-image"
            alt="FeedTrack logo"
          />
        </div>
        <button onClick={() => setHidden(false)}>Leave us a feedback</button>
        <div
          className="feedback-section"
          style={{ display: hidden ? "none" : "block" }}
        >
          <h2>Your feedback:</h2>
          <h3>What is your opinion about the service? </h3>
          <SmileyFeedback onClick={handleSmileyClick} />
          <button onClick={sendFeedback}>Submit</button>
        </div>
      </div>
    </div>
  );
};

const SmileyFeedback = ({ onClick }) => {
  const smileys = [
    { level: 1, color: "red", symbol: "😡" },
    { level: 2, color: "orange", symbol: "😐" },
    { level: 3, color: "yellow", symbol: "😊" },
    { level: 4, color: "lightgreen", symbol: "😃" },
    { level: 5, color: "green", symbol: "😍" },
  ];

  const [clickedIndex, setClickedIndex] = useState(null);

  const handleSmileyClick = (level, index) => {
    onClick(level);
    setClickedIndex(index);
  };

  return (
    <div className="smiley-feedback">
      {smileys.map((smiley, index) => (
        <span
          key={smiley.level}
          className={clickedIndex === index ? "clicked" : ""}
          style={{
            color: smiley.color,
            cursor: "pointer",
            fontSize: "2em",
            marginRight: "10px",
          }}
          onClick={() => handleSmileyClick(smiley.level, index)}
        >
          {smiley.symbol}
        </span>
      ))}
    </div>
  );
};

export default UserFeedbackInput;
