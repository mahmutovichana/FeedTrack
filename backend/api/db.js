require('dotenv').config();
const { Pool } = require("pg");

const { DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_DATABASE,
  user: DB_USER,
  password: DB_PASSWORD,
});

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }

  console.log("Connected to the database!");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
