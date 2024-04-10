const express = require('express');
const router = express.Router(); // Router initialization
const db = require("./../../db");

// Ruta za dobijanje svih jedinstvenih area vrijednosti
router.get('/branches/areas', async (req, res) => {
    try {
        const query = 'SELECT DISTINCT area FROM "Branch"';
        const { rows } = await db.query(query);
        const areas = rows.map(row => row.area);
        res.json(areas);
    } catch (error) {
        console.error('Error fetching unique areas:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ruta za dobijanje svih filijala koje pripadaju odabranom kantonu
router.get('/branches/by-area/:area', async (req, res) => {
    try {
        const { area } = req.params;
        const query = 'SELECT * FROM "Branch" WHERE area = $1';
        const { rows } = await db.query(query, [area]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching branches by area:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
