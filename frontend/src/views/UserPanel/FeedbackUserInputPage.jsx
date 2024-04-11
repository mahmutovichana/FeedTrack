import React, { useState } from 'react';
import './../../styles/UserPanel/feedbackUserInput.css';
import feedtrackLogo from "./../../assets/feedtrackLogoBlack.svg";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const UserFeedbackInput = () => {
  const [satisfactionLevel, setSatisfactionLevel] = useState(null);

  const handleSmileyClick = (level) => {
    setSatisfactionLevel(level);
  };

  const sendFeedback = async () => {
    if (satisfactionLevel !== null) {
      toast("Thank you for your feedback :)"); 
      console.log('Feedback sent successfully:', satisfactionLevel);
    } else {
      toast.error("Please select a sastisfaction level!"); 
      console.log('Please select a satisfaction level.');
    }
  };

  return (
    <div className='feedbackUserInputContainer'>
      <div className="container">
        <div className="logo">
          <img src={feedtrackLogo} className="logo-image" alt="FeedTrack logo" />
        </div>
        <div className="feedback-section">
          <h2>Your feedback:</h2>
          <h3>What is your opinion about the service? </h3>
          <SmileyFeedback onClick={handleSmileyClick} />
          <button onClick={sendFeedback}>Submit</button>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
};

const SmileyFeedback = ({ onClick }) => {
  const smileys = [
    { level: 1, color: 'red', symbol: '😡' },
    { level: 2, color: 'orange', symbol: '😐' },
    { level: 3, color: 'yellow', symbol: '😊' },
    { level: 4, color: 'lightgreen', symbol: '😃' },
    { level: 5, color: 'green', symbol: '😍' },
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
          className={clickedIndex === index ? 'clicked' : ''}
          style={{ color: smiley.color, cursor: 'pointer', fontSize: '2em', marginRight: '10px' }}
          onClick={() => handleSmileyClick(smiley.level, index)}
        >
          {smiley.symbol}
        </span>
      ))}
    </div>
  );
};

export default UserFeedbackInput;

