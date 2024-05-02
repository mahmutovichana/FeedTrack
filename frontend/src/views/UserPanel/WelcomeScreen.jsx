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
        setWelcomeData({ ...welcomeData, message: "Hello World!" });
      });

    setBranchLocation(localStorage.getItem("storedBranchLocation"));
    setSelectedTellerID(localStorage.getItem("tellerPositionID"));
  }, []);

  useEffect(() => {
    if (videoLoaded && videoRef.current) {
      videoRef.current.play().catch(error => console.error(error));
    }
  }, [videoLoaded]);

  /* useEffect(() => {
    // Prvo čekanje prije pokretanja ciklusa
    setTimeout(() => {
      setShowContent(true);
    }, 7000);

    const showContentInterval = setInterval(() => {
      setShowContent(false);
      setTimeout(() => {
        setShowContent(true);
      }, 7330); // Prikaži sadržaj 4 sekunde
    }, 11230); // Ciklus čekanja 7 sekundi + prikaz 4 sekunde
    
    return () => {
      clearInterval(showContentInterval);
    };
  }, []); */  

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
            src="teaser7.mp4" 
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
