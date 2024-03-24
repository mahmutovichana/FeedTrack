import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mysql from "mysql2";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

const app = express();
dotenv.config();

const PORT = 3000;
const URL = process.env.BACKEND_URL || "http://localhost:3000";

passport.use(
  new GoogleStrategy(
    {
      callbackURL: `${URL}/auth/google/callback`,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile, "profile");

      // TODO: Store user in the database

      done(null, user);
    }
  )
);

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL database:", error);
  } else {
    console.log("Connected to MySQL database!");
  }
});

app.get("/api", (req, res) => {
  res.json({ name: "Hana" });
});

app.get("/api/branches", (req, res) => {
  connection.query("SELECT * FROM Branch", (error, results) => {
    if (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ error: "Error fetching branches" });
    } else {
      console.log("Branches:", results);
      res.json(results);
    }
  });
});

app.listen(PORT || 3000, () =>
  console.log(`Server ready on port ${PORT || 3000}.`)
);
