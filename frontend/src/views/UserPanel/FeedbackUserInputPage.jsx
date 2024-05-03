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
        const storedPageSize = localStorage.getItem("pageSize");
        return storedPageSize ? parseInt(storedPageSize) : 5;
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [feedbacks, setFeedbacks] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [welcomeData, setWelcomeData] = useState({});
    const [branchLocation, setBranchLocation] = useState("");
    const [selectedTellerID, setSelectedTellerID] = useState("");
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
    const [pages, setPages] = useState([]);
    const [startIndexes, setStartIndexes] = useState([]);
    const [endIndexes, setEndIndexes] = useState([]);

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

            // if there are no questions
            if(questionData.length === 0) {
                console.log("There are no questions in campaigns related to this branchID");
                const newQuestion = {
                    "campaignID": "0",
                    "questionID": "0",
                    "cname": "Default Campaign",
                    "qname": "How would you rate our service?",
                    "branchID": branchID,
                    "questionsperpage": "1",
                    "answerLevel": "3"
                };
                questionData.push(newQuestion);
            }

            const campaignOrderMapString = localStorage.getItem('campaignOrderMap');
            const campaignOrderMap = campaignOrderMapString ? JSON.parse(campaignOrderMapString) : {};
            const campaignNames = campaignOrderMap[branchID] || [];
            //console.log("campaignNames: ", campaignNames);

            // If campaignNames is empty, we add the campaign names from questionData
            if (campaignNames.length === 0 && questionData.length > 0) {
                // We add first cname to campaignNames
                campaignNames.push(questionData[0].cname);

                // We iterare through remaining elements of questionData to find different cnames and add them to campaignNames
                questionData.forEach((item, index) => {
                    if (index !== 0 && !campaignNames.includes(item.cname)) {
                        campaignNames.push(item.cname);
                    }
                });
            }

            // Definirajte funkciju za izvlačenje vrijednosti na osnovu redoslijeda iz campaignNames
            function extractValuesBasedOnOrder(data, order) {
                const extractedValues = [];
                order.forEach(cname => {
                    const matchingObject = data.find(obj => obj.cname === cname);
                    if (matchingObject) {
                        extractedValues.push(matchingObject.questionsperpage);
                    }
                });
                return extractedValues;
            }

            // Nakon što dobijete questionData i campaignNames, pozovite funkciju
            const extractedValues = extractValuesBasedOnOrder(questionData, campaignNames);

            // Ispisivanje rezultata
            //console.log("exctracted values:",extractedValues);


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

            function napraviNoviNiz(Niz1, Niz2) {
                const NoviNiz = [];

                for (let i = 0; i < Niz1.length; i++) {
                    const broj_ponavljanja = Math.floor(Niz1[i] / Niz2[i]);
                    const ostatak = Niz1[i] % Niz2[i];

                    // Dodajemo elemente broj_ponavljanja puta
                    for (let j = 0; j < broj_ponavljanja; j++) {
                        NoviNiz.push(Niz2[i]);
                    }

                    // Dodajemo ostatak ako postoji
                    if (ostatak > 0) {
                        NoviNiz.push(ostatak);
                    }
                }

                return NoviNiz;
            }

            // Testiranje funkcije
            const Niz1 = [1, 4, 4];
            const Niz2 = [3, 3, 1];
            //const NoviNiz = napraviNoviNiz(Niz1, Niz2);
            const NoviNiz = napraviNoviNiz(sizes, extractedValues); //expecting 4 4 2 1 1
            //console.log("NoviNiz:",NoviNiz); // Rezultat bi trebao biti [3, 3, 2, 3, 1, 1, 1, 1, 1]

            // Initializing the arrays startIndex and endIndex
            const startIndex = [0];
            const endIndex = [NoviNiz[0] - 1];

            // Filling the arrays startIndex and endIndex
            for (let i = 1; i < NoviNiz.length; i++) {
                startIndex[i] = parseInt(startIndex[i - 1]) + parseInt(NoviNiz[i - 1]);
                endIndex[i] = parseInt(endIndex[i - 1]) + parseInt(NoviNiz[i]);
            }

            //console.log("startIndex:", startIndex);
            //console.log("endIndex:", endIndex);

            // Set the sizes state
            setPages(NoviNiz);
            //console.log("sizes:", sizes);
            setStartIndexes(startIndex);
            setEndIndexes(endIndex);

            // Function to sort objects based on the desired order array
            const sortByDesiredOrder = (a, b) => {
                return campaignNames.indexOf(a.cname) - campaignNames.indexOf(b.cname);
            };

            // Sorting the array of objects
            questionData.sort(sortByDesiredOrder);

            // Printing the sorted array of objects
            //console.log("sorted:", questionData);

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
        console.log("I'm in");
        localStorage.setItem("pageSize", pageSize.toString());
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
        fetch(`${deployURLs.backendURL}/api/thankYouData`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then(({ image, message }) => {
                setThankYouData({ image, message });
            })
            .catch(() => {
                setThankYouData({ ...thankYouData, message: "Hello World!" });
            });
        // Fetch questions from database
        fetchQuestionsFromDatabase();

    }, [currentPage, pageSize]);

    useEffect(() => {
        if (timer) clearInterval(timer); // Reset previous timer

        // Define time limit based on number of questions per page
        const questionsPerPage = pages[currentPage - 1]; // Updated to use pageSize from pages array
        let timeLimitPerPage = questionsPerPage * 4; // For example, set 6 seconds per question

        // Add extra 5 seconds on last page
        if (currentPage === Math.ceil(pages.length)) {
            timeLimitPerPage += 5;
        }

        // Add extra 4 seconds on first page
        if (currentPage === 1) {
            timeLimitPerPage += 4;
        }

        setRemainingTime(timeLimitPerPage);
        const interval = setInterval(() => {
            setRemainingTime((prevTime) => {
                console.log("Remaining time:", prevTime); // Log remaining time to console
                return prevTime - 1;
            });
        }, 1000);

        setTimer(interval);

        return () => clearInterval(interval); // Reset timer when component unmounts or when user submits answers
    }, [currentPage, pageSize, pages]);


    useEffect(() => {
        // Check if remaining time has expired and redirect user if so
        if (remainingTime === 0) {
            clearInterval(timer); // Stop the timer
            // Redirect user to another page here
            navigate("/welcomeScreen");
        }
    }, [remainingTime]);

    const handleFeedbackChange = async (questionID, level) => {
        const updatedFeedbacks = [...feedbacks];
        const index = updatedFeedbacks.findIndex(
            (item) => item.questionID === questionID
        );
        if (index !== -1) {
            updatedFeedbacks[index].rating = level;
        } else {
            try {
                const response = await fetch(
                    `${deployURLs.backendURL}/api/campaignQuestion/byQuestionID/${questionID}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${localStorage.token}`,
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const questionCampaignID = data[0].campaignID;
                        updatedFeedbacks.push({
                            questionID,
                            rating: level,
                            tellerPositionID,
                            campaignID: questionCampaignID,
                            date: formatDate(Date.now()),
                        });
                    } else {
                        console.error(`No campaign found for question ID ${questionID}.`);
                    }
                } else {
                    console.error(
                        `Failed to fetch campaign ID for question ID ${questionID}.`
                    );
                }
            } catch (error) {
                console.error("Problem fetching campaign ID:", error);
            }
        }
        setFeedbacks(updatedFeedbacks);
        const startIndex = startIndexes[currentPage - 1];
        const endIndex = endIndexes[currentPage - 1] + 1;
        const allQuestionsAnswered = questions.slice(startIndex, endIndex).every(q => updatedFeedbacks.some(f => f.questionID === q.questionID));

        if (allQuestionsAnswered && currentPage < (pages.length)) {
            handlePageChange(currentPage + 1);
        }
        if (allQuestionsAnswered && currentPage === (pages.length)) {
            handleSubmit(updatedFeedbacks);
        }
    };

    const handleSubmit = async (updatedFeedbacks) => {
        try {
            // Log data being sent to console
            updatedFeedbacks.forEach((feedback) => {
                console.log("Data to be sent:", feedback);
            });

            // Create an array to hold all promises for HTTP requests
            const allPromises = [];

            // Iterate over each feedback and create a promise for each request
            updatedFeedbacks.forEach((feedback) => {
                const promise = fetch(
                    `${deployURLs.backendURL}/api/feedbacks/insertFeedback`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.token}`,
                        },
                        body: JSON.stringify(feedback),
                    }
                );
                allPromises.push(promise); // Add the promise to the array
            });
            setShowThankYouMessage(true); // Show Thank You message after successful submission

            // Wait for all promises to resolve using Promise.all
            const responses = await Promise.all(allPromises);

            // Check responses and handle errors if necessary
            responses.forEach((response) => {
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
        const startIndex = startIndexes[currentPage - 1];
        const endIndex = endIndexes[currentPage - 1] + 1;
        //console.log("start:", startIndex, " end:", endIndex);
        return questions.slice(startIndex, endIndex).map(question => (
            <FeedbackContainer key={question.questionID} question={question} onFeedbackChange={handleFeedbackChange} />
        ));
    };

    return (
        <div className="feedbackUserInputContainer">
            <div className="container">
                <div className="info">
                    <h3>Branch: {branchLocation}</h3>
                    <h3>Teller ID: {tellerPositionID}</h3>
                </div>
                <div className="logo">
                    <img src={welcomeData.image} alt="FeedTrack logo" className="logo-image" />
                </div>
                <div className="feedback-section">{renderQuestions()}</div>
                {showThankYouMessage && (
                    <div className="thankYouScreenContainer">
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

const FeedbackContainer = ({ question, onFeedbackChange }) => {
    const [rating, setRating] = useState(null);

    const handleSmileyClick = (level) => {
        setRating(level);
        onFeedbackChange(question.questionID, level);
    };

    return (
        <div className="feedback-container">
            <h3>{question.qname}</h3>
            <SmileyFeedback onClick={handleSmileyClick} answerLevel={question.answerLevel} />
        </div>
    );
};

const SmileyFeedback = ({ onClick, answerLevel }) => {
    let smileys = [];
    switch (answerLevel) {
        case "2":
            smileys = [
                { level: 1, color: "red", symbol: "X", className: "negation" },
                { level: 5, color: "green", symbol: "✓", className: "confirmation" },
            ];
            break;
        case "3":
            smileys = [
                { level: 1, color: "red", symbol: "🙁" },
                { level: 3, color: "orange", symbol: "😐" },
                { level: 5, color: "yellow", symbol: "😊" },
            ];
            break;
        case "4":
            smileys = [
                { level: 1, color: "red", symbol: "🙁" },
                { level: 2, color: "orange", symbol: "😐" },
                { level: 4, color: "yellow", symbol: "😊" },
                { level: 5, color: "lightgreen", symbol: "😃" },
            ];
            break;
        default:
            // Default smileys if answerLevel is not specified or invalid
            smileys = [
                { level: 1, color: "red", symbol: "😡" },
                { level: 2, color: "orange", symbol: "😐" },
                { level: 3, color: "yellow", symbol: "😊" },
                { level: 4, color: "lightgreen", symbol: "😃" },
                { level: 5, color: "green", symbol: "😍" },
            ];
    }

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