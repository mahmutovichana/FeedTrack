const express = require('express');
const router = express.Router(); // Router initialization
const db = require("./../../db");

// Route for getting all unique values for areas from branches
router.get('/branches/areas', async (req, res) => {
    try {
        const query = 'SELECT DISTINCT area FROM "branch"';
        const { rows } = await db.query(query);
        const areas = rows.map(row => row.area);
        res.json(areas);
    } catch (error) {
        console.error('Error fetching unique areas:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for getting all branches grouped by their area 
router.get('/branches/by-area/:area', async (req, res) => {
    try {
        const { area } = req.params;
        const query = 'SELECT * FROM "branch" WHERE area = $1';
        const { rows } = await db.query(query, [area]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching branches by area:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
