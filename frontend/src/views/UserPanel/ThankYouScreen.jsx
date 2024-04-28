import React, { useState, useEffect } from "react";
import { deployURLs } from "../../../public/constants.js";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./../../styles/UserPanel/thankYouScreen.scss";

const ThankYouScreen = () => {
    const navigate = useNavigate();
    const [thankYouData, setThankYouData] = useState({});

    useEffect(() => {
        /*
        this is only for demonstration purposes new route for
        thankYouData needs to be made and page for editing that data also
        */
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
            });

        //this is hardcoded for now to have difference beside welcomeData
        setThankYouData({image: "FeedTrack logo", message: "Thank you!"});
        //thankYouData.image = "FeedTrack logo";

        const timeout = setTimeout(() => {
            navigate('/welcomeScreen'); // Zamijenite '/redirectedPage' sa putanjom na koju želite preusmjeriti korisnika
        }, 10000); // 10000 milisekundi = 10 sekundi

        return () => clearTimeout(timeout); // Resetujemo tajmer kada se komponenta unmountuje
    }, [navigate]);

    //setThankYouData({image: "FeedTrack logo", message: "Thank you!"});

    return (

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
    );
};

export default ThankYouScreen;
