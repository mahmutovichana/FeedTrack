const express = require('express');
const router = express.Router();
const db = require("./../../db");

// Route for retrieving teaser's display image by its teaser link
const getTeaserImage = async (teaserLink) => {
    try {
        const query = `
            SELECT * 
            FROM "teaserdata" 
            WHERE "teaserdata".teaser = $1
        `;
        const { rows } = await db.query(query, [teaserLink]);
        return rows;
    } catch (error) {
        throw error;
    }
};

router.post('/teaserData/getImage', async (req, res) => {
    try {
        try { res.json(await getTeaserImage(req.body.teaser)); }
        catch (error) { throw error; }
    } catch (error) {
        throw error;
    }
});

module.exports = router;