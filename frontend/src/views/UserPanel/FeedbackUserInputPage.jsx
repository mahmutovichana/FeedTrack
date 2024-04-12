import React, { useState, useEffect } from 'react';
import './../../styles/UserPanel/feedbackUserInput.css';
import feedtrackLogo from "./../../assets/feedtrackLogoBlack.svg";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { deployURLs } from "./../../../public/constants";

const UserFeedbackInput = () => {

    const [welcomeMessage, setWelcomeMessage] = useState("");

    useEffect(() => {
        fetch(`${deployURLs.backendURL}/api/welcomeData`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setWelcomeMessage(data.message);
            });
    }, []);

    const storedBranch = JSON.parse(localStorage.selectedBranch);
    const storedTeller = JSON.parse(localStorage.selectedTeller);
    const [satisfactionLevel, setSatisfactionLevel] = useState(null);
    const [branchLocation, setBranchLocation] = useState('');
    const [selectedTellerID, setSelectedTellerID] = useState('');
    const [questionsPerPage, setQuestionsPerPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [pageSize, setPageSize] = useState(() => {
        return questionsPerPage ? parseInt(questionsPerPage) : 5;
    });
    let storedCampaign = useState(null);

    const handleSmileyClick = (level) => {
        setSatisfactionLevel(level);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleFeedbackChange = (questionID, level) => {
        const updatedFeedbacks = [...feedbacks];
        const index = updatedFeedbacks.findIndex(item => item.questionID === questionID);
        if (index !== -1) {
            updatedFeedbacks[index].rating = level;
        } else {
            updatedFeedbacks.push({ questionID, rating: level, tellerPositionID: storedTeller.id, campaignID: storedBranch.id, date: formatDate(Date.now()) });
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

    const renderQuestions = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, questions.length);
        return questions.slice(startIndex, endIndex).map(question => (
            <FeedbackContainer key={question.id} question={question} onFeedbackChange={handleFeedbackChange} />
        ));
    };

    useEffect(() => {
        const storedBranch = JSON.parse(localStorage.selectedBranch);
        const storedTeller = JSON.parse(localStorage.selectedTeller);
        setBranchLocation(storedBranch.location);
        setSelectedTellerID(storedTeller.id);

        const fetchData = async () => {
            try {
                const storedBranch = JSON.parse(localStorage.getItem('selectedBranch'));
                const storedTeller = JSON.parse(localStorage.getItem('selectedTeller'));
                setBranchLocation(storedBranch.location);
                setSelectedTellerID(storedTeller.id);

                // API ruta za dohvaćanje svih kampanja i pronalazak odgovarajuće kampanje
                const response = await fetch(`${deployURLs.backendURL}/api/campaigns`);
                const campaigns = await response.json();
                storedCampaign = campaigns.find(campaign => storedBranch.campaignID === campaign.id);

                if (!storedCampaign) {
                    toast.error('No campaign going on at the moment :('); return;
                }

                const questionsPerPageResponse = await fetch(`${deployURLs.backendURL}/api/campaigns/${storedCampaign.id}/questionsPerPage`);
                const data = await questionsPerPageResponse.json();
                setQuestionsPerPage(data.questionsPerPage); // Ispravno postavljanje questionsPerPage
                console.log(`Questions per page of ${storedCampaign.name} is ${questionsPerPage}`); // Ispis ispravne vrijednosti
                // Dohvaćanje svih pitanja povezanih s kampanjom
                try {

                    const campaignQuestionsResponse = await fetch(`${deployURLs.backendURL}/api/campaigns/${storedCampaign.id}/campaignQuestions`);
                    const campaignQuestions = await campaignQuestionsResponse.json();

                    if (campaignQuestions && campaignQuestions.length > 0) {
                        console.log(campaignQuestions);
                        // Izdvojimo sve ID-jeve pitanja
                        const questionIDs = campaignQuestions.map(cq => cq.questionID);

                        // Dohvaćanje svih pitanja čiji su ID-jevi u listi questionIDs
                        const questionsResponse = await fetch(`${deployURLs.backendURL}/api/questions`);
                        const allQuestions = await questionsResponse.json();

                        // Filtriranje pitanja povezanih s kampanjom
                        const campaignQuestionsData = allQuestions.filter(question => questionIDs.includes(question.id));

                        // Postavljanje dobivenih pitanja
                        setQuestions(campaignQuestionsData);
                        console.log(questions);
                        // Postavljanje broja pitanja po stranici
                        setPageSize(data.questionsPerPage);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [questionsPerPage, pageSize, storedCampaign]);

    const sendFeedback = async () => {
        if (satisfactionLevel !== null) {
            handleSubmit(); // Pozivamo handleSubmit prije slanja feedbacka
            toast("Thank you for your feedback :)");
            console.log('Feedback sent successfully:', satisfactionLevel);
        } else {
            toast.error("Please select a satisfaction level!");
            console.log('Please select a satisfaction level.');
        }
    };

    const handleSubmit = async () => {
        console.log("Feedbacks:", feedbacks);
        try {
            // Kreiramo niz fetch zahtjeva za spremanje feedbacka
            const requests = feedbacks.map(obj => (
                fetch(`http://localhost:5432/api/feedbacks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.token}`
                    },
                    body: JSON.stringify(obj)
                })
            ));

            // Čekamo da se svi zahtjevi za spremanje feedbacka završe
            await Promise.all(requests);

            console.log("All feedbacks saved successfully!");
        } catch (error) {
            console.error('Error saving feedbacks:', error);
            toast.error('Error saving feedbacks');
        }
    };


    return (
        <div className='feedbackUserInputContainer'>
            <div className="container">
                <div className='info'>
                    <h3>Branch: {branchLocation}</h3>
                    <h3>Teller ID: {storedTeller.id}</h3>
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
                    <h3>What is your opinion about the service? </h3>
                    {renderQuestions()}
                    {showSubmitButton && <button onClick={handleSubmit}>Submit</button>}
                    {currentPage !== Math.ceil(questions.length / pageSize) && showNextButton && <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>}
                    <SmileyFeedback onClick={handleSmileyClick} />
                    <button onClick={sendFeedback}>Submit</button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

const FeedbackContainer = ({ question, onFeedbackChange }) => {
    const [rating, setRating] = useState(null);

    const handleSmileyClick = (level) => {
        setRating(level);
        onFeedbackChange(question.id, level);
    };

    console.log(question);

    return (
        <div className="feedback-container">
            <h3>{question.name}</h3>
            <SmileyFeedback onClick={handleSmileyClick} />
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

