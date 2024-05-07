const axios = require('axios');
const fs = require('fs');
const router = require("express").Router();

router.get('/download-pdf', async (req, res) => {
    try {
        const LOOKER_STUDIO_URL = 'https://lookerstudio.google.com/embed/reporting/0d38b52c-a24b-4bce-aed1-c5c65c9a9a54/page/qlD';
        const LOOKER_STUDIO_API_KEY = '613438595302-q36ubvr0othatg6lcpmrm7t52vu6jqkq.apps.googleusercontent.com';

        // Izvršite zahtev ka Looker Studio-u za preuzimanje izveštaja kao PDF
        const response = await axios.get(`${LOOKER_STUDIO_URL}&pdf=1`, {
            headers: {
                'Authorization': `Bearer ${LOOKER_STUDIO_API_KEY}`
            },
            responseType: 'arraybuffer' // Postavite tip odgovora na array buffer
        });

        // Sačuvajte preuzeti PDF izveštaj na serveru
        fs.writeFileSync('FeedTrack Dashboard.pdf', response.data);

        // Pošaljite preuzeti PDF izveštaj korisniku
        res.sendFile('FeedTrack Dashboard.pdf');
    } catch (error) {
        console.error('Greška prilikom preuzimanja PDF-a:', error);
        res.status(500).send('Došlo je do greške prilikom preuzimanja PDF-a');
    }
});

module.exports = router;