import React, { useState, useEffect } from 'react';
import './../../styles/UserPanel/feedbackUserInput.css';
import feedtrackLogo from "./../../assets/feedtrackLogoBlack.svg";
import { deployURLs } from "../../../public/constants.js";
import './../../styles/UserPanel/feedbackUserInput.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


//function for conversion of date
function formatDate(timestamp) {
    const padZero = (num) => (num < 10 ? '0' + num : num);

    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1); // Mjeseci počinju od 0
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const UserFeedbackInput = () => {
    const [pageSize, setPageSize] = useState(() => {
        const storedPageSize = localStorage.getItem('pageSize');
        return storedPageSize ? parseInt(storedPageSize) : 5;
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [feedbacks, setFeedbacks] = useState([]);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [branchLocation, setBranchLocation] = useState('');
    const [selectedTellerID, setSelectedTellerID] = useState('');

    //Using values stored in localStorage
    const campaignID = localStorage.campaignID;
    //const campaignID = 27;
    const tellerPositionID = localStorage.getItem('tellerPositionID');
    //const tellerPositionID = 2;
    const storedBranchLocation = localStorage.getItem('storedBranchLocation');

    //const storedBranchLocation = "Bubasvaba";

    async function fetchQuestionsFromDatabase() {
        try {
            const response = await fetch(`http://localhost:5432/api/campaign/view/${campaignID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Error fetching questions');
            }
            const data = await response.json();
            console.log("Fetched questions:", data);
            const extractedValuesArray = data.map(({ questionID:id, qname:name  }) => ({ id, name }));

            console.log(extractedValuesArray);

            //const modifiedData =
            setQuestions(extractedValuesArray); // Postavi stanje questions na dobavljene podatke
        } catch (error) {
            console.error("Problem fetching questions:", error);
        }
    }

    useEffect(() => {
        localStorage.setItem('pageSize', pageSize.toString());
        fetch(`${deployURLs.backendURL}/api/welcomeData`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setWelcomeMessage(data.message);
            });
        //const storedBranch = localStorage.getItem("selectedBranch");
        //const storedTeller = localStorage.getItem("selectedTeller");
        setBranchLocation(storedBranchLocation);
        setSelectedTellerID(tellerPositionID);
        fetchQuestionsFromDatabase();
        setShowNextButton(false);
    }, [currentPage, pageSize]);



    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleFeedbackChange = (questionID, level) => {
        const updatedFeedbacks = [...feedbacks];
        const index = updatedFeedbacks.findIndex(item => item.questionID === questionID);
        if (index !== -1) {
            updatedFeedbacks[index].rating = level;
        } else {
            updatedFeedbacks.push({ questionID, rating: level, tellerPositionID, campaignID, date: formatDate(Date.now())});
        }
        setFeedbacks(updatedFeedbacks);

        // Provjeri jesu li sva pitanja na trenutnoj stranici odgovorena
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, questions.length); // Izračunaj endIndex tako da ne izlazi iz opsega
        const allQuestionsAnswered = questions.slice(startIndex, endIndex).every(q => updatedFeedbacks.some(f => f.questionID === q.id));
        setShowNextButton(allQuestionsAnswered);

        // Ako su odgovorena sva pitanja na svim stranicama, prikaži gumb "Submit"
        if (updatedFeedbacks.length === questions.length) {
            setShowSubmitButton(true);
        }
    };

    const handleSubmit = () => {
        console.log("Feedbacks:", feedbacks);
        feedbacks.forEach(obj => {
            console.log(obj);
            fetch(`http://localhost:5432/api/feedbacks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.token}`
                },
                body: JSON.stringify(obj)
            })
        });
    };

    const renderQuestions = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, questions.length);
        return questions.slice(startIndex, endIndex).map(question => (
            <FeedbackContainer key={question.id} question={question} onFeedbackChange={handleFeedbackChange} />
        ));
    };

    return (
        <div className='feedbackUserInputContainer'>
            <div className="container">
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
                <div className="feedback-section">
                    <h2>Your feedback:</h2>
                    {renderQuestions()}
                    {showSubmitButton && <button onClick={handleSubmit}>Submit</button>}
                    {currentPage !== Math.ceil(questions.length / pageSize) && showNextButton &&
                        <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>}
                </div>
            </div>
        </div>
    );
};

const FeedbackContainer = ({question, onFeedbackChange}) => {
    const [rating, setrating] = useState(null);

    const handleSmileyClick = (level) => {
        setrating(level);
        onFeedbackChange(question.id, level);
    };

    return (
        <div className="feedback-container">
            <h3>{question.name}</h3>
            <SmileyFeedback onClick={handleSmileyClick}/>
        </div>
    );
};

const SmileyFeedback = ({onClick}) => {
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
