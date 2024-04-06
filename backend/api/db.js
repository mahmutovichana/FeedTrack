require('dotenv').config();
const { Pool } = require("pg");

console.log('DB_CONN_STRING:', process.env.DB_CONN_STRING);

const pool = new Pool({
  connectionString: process.env.DB_CONN_STRING,
});

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }

  if (process.env.DB_CONN_STRING.includes('localhost')) {
    console.log("Connected to database locally!");
  } else {
    console.log("Connected to database on the internet!");
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
