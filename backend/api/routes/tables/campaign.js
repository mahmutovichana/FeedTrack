const express = require('express');
const router = express.Router(); // Router initialization
const db = require("./../../db");

// Route for getting questions per page for a specific campaign
router.get('/campaigns/:campaignID/questionsPerPage', async (req, res) => {
    try {
        const { campaignID } = req.params;
        // fetch questions per page for the specified campaign
        const query = 'SELECT questionsperpage FROM "campaign" WHERE id = $1';
        const { rows } = await db.query(query, [campaignID]);
        if (rows.length === 0) {
            throw new Error('Campaign not found');
        }
        const questionsPerPage = rows[0].questionsperpage; // Corrected column name
        res.json({ questionsPerPage });
    } catch (error) {
        console.error('Error fetching questions per page:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for getting all questions from a given campaign
router.get('/campaigns/:campaignID/campaignQuestions', async (req, res) => {
    try {
        const { campaignID } = req.params;
        const query = `
            SELECT "question".id, "question".name
            FROM "campaignQuestion"
            JOIN "question" ON "campaignquestion"."questionID" = "question".id
            WHERE "campaignquestion"."campaignID" = $1
        `;
        const { rows } = await db.query(query, [campaignID]);
        const questions = rows.map(row => ({
            id: row.id,
            name: row.name
        }));
        res.json(questions);
    } catch (error) {
        console.error('Error fetching campaign questions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;