import React, { useState, useEffect } from 'react';
import { deployURLs } from "../../../public/constants.js";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './../../styles/UserPanel/welcomeScreen.scss';


const WelcomeScreen = () => {
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [branchLocation, setBranchLocation] = useState('');
    const [selectedTellerID, setSelectedTellerID] = useState('');
    const navigate = useNavigate();

    //Using values stored in localStorage
    const campaignID = localStorage.campaignID;
    const tellerPositionID = localStorage.getItem('tellerPositionID');
    const storedBranchLocation = localStorage.getItem('storedBranchLocation');

    useEffect(() => {
        fetch(`${deployURLs.backendURL}/api/welcomeData`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setWelcomeMessage(data.message);
            });
        setBranchLocation(storedBranchLocation);
        setSelectedTellerID(tellerPositionID);
    }, []);

    const handleSubmit = () => {
        navigate('/userFeedback');
    };


    return (
        <div className='welcomeScreenContainer'>
                <div className='info'>
                    <h3>Branch: {branchLocation}</h3>
                    <h3>Teller ID: {tellerPositionID}</h3>
                </div>
                <div className="logo">
                    <img
                        src={`${deployURLs.backendURL}/api/welcomeData/welcome-image.png`}
                        className="logo-image"
                        alt="FeedTrack logo"
                    />
                    <h1>{welcomeMessage}</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <button type="submit" className="goToFeedback-button">Leave us a feedback</button>
                </form>
        </div>
    );
};


export default WelcomeScreen;
