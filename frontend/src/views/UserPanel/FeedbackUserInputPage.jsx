import React, { useState, useEffect } from "react";
import "./../../styles/UserPanel/feedbackUserInput.css";
import feedtrackLogo from "./../../assets/feedtrackLogoBlack.svg";
import { deployURLs } from "../../../public/constants.js";
import "./../../styles/UserPanel/feedbackUserInput.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

// function for date conversion
function formatDate(timestamp) {
    const padZero = (num) => (num < 10 ? "0" + num : num);

    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1); // Months are zero based
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
    const [questions, setQuestions] = useState([]);
    const [welcomeData, setWelcomeData] = useState({});
    const [branchLocation, setBranchLocation] = useState('');
    const [selectedTellerID, setSelectedTellerID] = useState('');
    const navigate = useNavigate();
    const [thankYouData, setThankYouData] = useState({});

    // Adding state for timer
    const [timer, setTimer] = useState(null);
    const [remainingTime, setRemainingTime] = useState(null);

    // Adding state for showing Thank You message
    const [showThankYouMessage, setShowThankYouMessage] = useState(false);

    // Using values stored in localStorage
    const branchID = localStorage.branchPositionID;
    const tellerPositionID = localStorage.getItem('tellerPositionID');
    const storedBranchLocation = localStorage.getItem('storedBranchLocation');
    const [sizes, setSizes] = useState([]);

    //function to fetch questions for required branchID with all relevant info
    const fetchQuestionsByBranchId = async (branchID) => {
        try {
            const response = await fetch(`${deployURLs.backendURL}/api/branchCampaigns/view/${branchID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.token}`
                }
            });
            const data = await response.json();
            return data; // Return the questions for the branch ID
        } catch (error) {
            console.error("Problem fetching questions:", error);
            return null;
        }
    };

    async function fetchQuestionsFromDatabase() {
        try {
            const questionDataPromise = await fetchQuestionsByBranchId(branchID);
            let questionData = await Promise.all(questionDataPromise);
            //console.log("Question data:",questionData);

            const campaignOrderMapString = localStorage.getItem('campaignOrderMap');
            const campaignOrderMap = campaignOrderMapString ? JSON.parse(campaignOrderMapString) : {};
            const campaignNames = campaignOrderMap[branchID] || [];
            console.log("campaignNames: ", campaignNames);

            // Create an object to store the sizes of each campaign
            const campaignSizes = {};

            // Count the number of questions for each campaign
            questionData.forEach(question => {
                const cname = question.cname;
                if (campaignSizes[cname] === undefined) {
                    campaignSizes[cname] = 1;
                } else {
                    campaignSizes[cname]++;
                }
            });
            // Create an array of sizes in the order of campaignNames
            const sizes = campaignNames.map(cname => campaignSizes[cname] || 0);

            // Set the sizes state
            setSizes(sizes);
            console.log("sizes:", sizes);

            // Function to sort objects based on the desired order array
            const sortByDesiredOrder = (a, b) => {
                return campaignNames.indexOf(a.cname) - campaignNames.indexOf(b.cname);
            };

            // Sorting the array of objects
            questionData.sort(sortByDesiredOrder);

            // Printing the sorted array of objects
            console.log("sorted:", questionData);

            questionData = questionData.flat();
            setQuestions(questionData);
            //console.log("questions by each campaign: " + JSON.stringify(questionData));
        } catch (error) {
            console.error("Problem fetching questions:", error);
        }
    }

    /*
        this is only for demonstration purposes new route for
        thankYouData needs to be made and page for editing that data also
        */
    /*
    fetch(`${deployURLs.backendURL}/api/welcomeData`, {
        method: "GET",
    })
        .then((res) => res.json())
        .then(({ image, message }) => {
            //just the idea
            //setThankYouData({ image, message });
        })
        .catch(() => {
            setThankYouData({ ...thankYouData, message: "Thank you!" });
        });*/



    //thankYouData.image = "FeedTrack logo";

    useEffect(() => {
        console.log("upad");
        /*
        * Inside of this useEffect thankYouData should be fetched
        */
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
        setBranchLocation(storedBranchLocation);
        setSelectedTellerID(tellerPositionID);
        //this is hardcoded for now to have difference beside welcomeData
        setThankYouData({ image: "FeedTrack logo", message: "Thank you!" });
        localStorage.setItem("pageSize", pageSize.toString());

        // Fetch questions from database
        fetchQuestionsFromDatabase();

    }, [currentPage, pageSize]);



    useEffect(() => {
        if (timer) clearInterval(timer); // Reset previous timer

        // Define time limit based on number of questions per page
        const questionsPerPage = pageSize;
        let timeLimitPerPage = questionsPerPage * 10; // For example, set 10 seconds per question

        // Add extra 5 seconds on last page
        if (currentPage === Math.ceil(questions.length / pageSize)) {
            timeLimitPerPage += 5;
        }

        // Add extra 4 seconds on first page
        if (currentPage === 1) {
            timeLimitPerPage += 4;
        }

        setRemainingTime(timeLimitPerPage);
        const interval = setInterval(() => {
            setRemainingTime(prevTime => {
                console.log("Remaining time:", prevTime); // Log remaining time to console
                return prevTime - 1;
            });
        }, 1000);

        setTimer(interval);

        return () => clearInterval(interval); // Reset timer when component unmounts or when user submits answers
    }, [currentPage, pageSize, questions.length]);

    useEffect(() => {
        // Check if remaining time has expired and redirect user if so
        if (remainingTime === 0) {
            clearInterval(timer); // Stop the timer
            // Redirect user to another page here
            navigate('/welcomeScreen');
        }
    }, [remainingTime]);

    const handleFeedbackChange = async (questionID, level) => {
        const updatedFeedbacks = [...feedbacks];
        const index = updatedFeedbacks.findIndex(item => item.questionID === questionID);
        if (index !== -1) {
            updatedFeedbacks[index].rating = level;
        } else {
            try {

                const response = await fetch(`${deployURLs.backendURL}/api/campaignQuestion/byQuestionID/${questionID}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const questionCampaignID = data[0].campaignID;
                        updatedFeedbacks.push({ questionID, rating: level, tellerPositionID, campaignID: questionCampaignID, date: formatDate(Date.now()) });
                    } else {
                        console.error(`No campaign found for question ID ${questionID}.`);
                    }
                } else {
                    console.error(`Failed to fetch campaign ID for question ID ${questionID}.`);
                }
            } catch (error) {
                console.error("Problem fetching campaign ID:", error);
            }
        }
        setFeedbacks(updatedFeedbacks);

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, questions.length);
        const allQuestionsAnswered = questions.slice(startIndex, endIndex).every(q => updatedFeedbacks.some(f => f.questionID === q.questionID));

        if (allQuestionsAnswered && currentPage < Math.ceil((questions.length) / pageSize)) {
            handlePageChange(currentPage + 1);
        }
        if (allQuestionsAnswered && currentPage === Math.ceil((questions.length) / pageSize)) {
            handleSubmit(updatedFeedbacks);
        }
    };

    const handleSubmit = async (updatedFeedbacks) => {
        try {

            // Log data being sent to console
            updatedFeedbacks.forEach(feedback => {
                console.log("Data to be sent:", feedback);
            });

            // Create an array to hold all promises for HTTP requests
            const allPromises = [];

            // Iterate over each feedback and create a promise for each request
            updatedFeedbacks.forEach(feedback => {
                const promise = fetch(`${deployURLs.backendURL}/api/feedbacks/insertFeedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.token}`
                    },
                    body: JSON.stringify(feedback)
                });
                allPromises.push(promise); // Add the promise to the array
            });
            setShowThankYouMessage(true); // Show Thank You message after successful submission

            // Wait for all promises to resolve using Promise.all
            const responses = await Promise.all(allPromises);

            // Check responses and handle errors if necessary
            responses.forEach(response => {
                if (!response.ok) {
                    // Handle error for failed request
                    console.error("Failed to submit feedback:", response.statusText);
                }
            });
            const timeout = setTimeout(() => {
                navigate('/welcomeScreen');
            }, 5000); // 1000 miliseconds = 1 second*/

        } catch (error) {
            console.error("Error submitting feedbacks:", error);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderQuestions = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, questions.length);
        return questions.slice(startIndex, endIndex).map(question => (
            <FeedbackContainer key={question.questionID} question={question} onFeedbackChange={handleFeedbackChange} />
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
                        src={welcomeData.image}
                        className="logo-image"
                        alt="FeedTrack logo"
                    />
                </div>
                <div className="feedback-section">
                    {renderQuestions()}
                </div>
                {showThankYouMessage && (
                    <div className="thankYouScreenContainer">
                        <div className={"info"}>
                            <h1>Thank you!</h1>
                        </div>
                        <div className="logo">
                            <img
                                src={thankYouData.image}
                                className="logo-image"
                                alt="FeedTrack logo"
                            />
                            <h1>{thankYouData.message}</h1>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FeedbackContainer = ({question, onFeedbackChange}) => {
    const [rating, setRating] = useState(null);

    const handleSmileyClick = (level) => {
        setRating(level);
        onFeedbackChange(question.questionID, level);
    };

    return (
        <div className="feedback-container">
            <h3>{question.qname}</h3>
            <SmileyFeedback onClick={handleSmileyClick} />
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