const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_CONN_STRING,
});

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }

  console.log("Connected to database!");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};