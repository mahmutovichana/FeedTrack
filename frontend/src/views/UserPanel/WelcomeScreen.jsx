import React, { useState, useEffect, useRef } from "react";
import { deployURLs } from "../../../public/constants.js";
import { useNavigate } from "react-router-dom";
import "./../../styles/UserPanel/welcomeScreen.scss";

const WelcomeScreen = () => {
  const [welcomeData, setWelcomeData] = useState({});
  const [branchLocation, setBranchLocation] = useState("");
  const [selectedTellerID, setSelectedTellerID] = useState("");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${deployURLs.backendURL}/api/welcomeData`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then(({ image, message }) => {
        setWelcomeData({ image, message });
      })
      .catch(() => {
        setWelcomeData({ ...welcomeData, 
          image: "data:image/png;base64,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", 
          message: "Hello World!" });
      });

    setBranchLocation(localStorage.getItem("storedBranchLocation"));
    setSelectedTellerID(localStorage.getItem("tellerPositionID"));
  }, []);

  useEffect(() => {
    if (videoLoaded && videoRef.current) {
      videoRef.current.play().catch(error => console.error(error));
    }
  }, [videoLoaded]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleSubmit = () => {
    navigate("/userFeedback");
  };

  return (
    <div className={`welcomeScreenContainer ${videoLoaded ? "show-video" : ""}`}>
      <div className="overlay">
        <div className="video-background">
          <video
            ref={videoRef}
            className="video-iframe"
            src={localStorage.getItem("teaserVideo")}
            autoPlay
            loop
            onLoadedData={handleVideoLoad}
            allowFullScreen
          ></video>
        </div>
        {showContent && (
          <div className={`welcome-content ${videoLoaded ? "show" : ""}`}>
            <div className="logo">
              <img src={welcomeData.image} alt="FeedTrack logo" className="logo-image" />
              <h1>{welcomeData.message}</h1>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <button type="submit" className={`goToFeedback-button show-button}`}>
            Leave us a feedback
          </button>
        </form>
      </div>
      <div className="info">
        <h3>Branch: {branchLocation}</h3>
        <h3>Teller ID: {selectedTellerID}</h3>
      </div>
    </div>
  );
};

export default WelcomeScreen;