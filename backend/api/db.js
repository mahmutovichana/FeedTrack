require('dotenv').config();
const { Pool } = require("pg");

const { DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;

const pool = new Pool({
  host: "aws-0-eu-central-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.gavgivgrmhhepowbdlxb",
  password: "feedtrack_password",
});

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);


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
