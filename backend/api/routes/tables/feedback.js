const express = require('express');
const router = express.Router(); // Router initialization
const db = require("./../../db");

// Unique route for inserting route based on generating id with sequence due to issues with concurrent insertion
const insertFeedback = async (feedbackData) => {
    try {
        const query = `
            INSERT INTO "Feedback" 
                ("id", "date", "rating", "tellerPositionID", "questionID", "campaignID")
            VALUES 
                (NEXTVAL('feedback_id_seq'), $1, $2, $3, $4, $5)
        `;
        const { date, rating, tellerPositionID, questionID, campaignID } = feedbackData;
        await db.query(query, [date, rating, tellerPositionID, questionID, campaignID]);
    } catch (error) {
        throw error;
    }
};

router.post('/feedbacks/insertFeedback', async (req, res) => {
    try {
        const feedbackData = req.body;
        await insertFeedback(feedbackData);
        res.status(201).send("Feedback inserted successfully");
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;