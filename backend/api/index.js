import express from "express";
import cors from "cors";
import mysql from 'mysql2';

const app = express();

app.use(cors());

const connection = mysql.createConnection({
  host: 'hwc.h.filess.io',
  user: 'FeedTrack_discoveris',
  password: '70a72453d3a793635719488c8a2acf1abcc7aa19',
  database: 'FeedTrack_discoveris',
  port: 3307
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL database:', error);
  } else {
    console.log('Connected to MySQL database!');
  }
});

app.get("/api/branches", (req, res) => {
    connection.query('SELECT * FROM Branch', (error, results) => {
      if (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ error: 'Error fetching branches' });
      } else {
        console.log('Branches:', results);
        res.json(results);
      }
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
