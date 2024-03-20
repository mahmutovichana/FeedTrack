import mysql from 'mysql2';

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
    fetchBranches();
  }
});

function fetchBranches() {
    connection.query('SELECT * FROM Branch', (error, results) => {
      if (error) {
        console.error('Error fetching branches:', error);
      } else {
        console.log('Branches:');
        results.forEach((branch) => {
          console.log(branch);
        });
      }
      connection.end(); // Zatvaramo konekciju nakon što dohvatimo podatke
    });
  }
