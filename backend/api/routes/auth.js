const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { generateUserJwtToken, authenticateToken } = require("./../middlewares/authMiddleware");
const speakeasy = require("speakeasy");
var QRCode = require("qrcode");

let refreshTokens = [];

// Route for login logic
router.post("/login", async (req, res) => {
  let { email, number, password } = req.body;
  if (!email && !number) return res.status(400).json({ message: "Email or mobile number is required!" });
  const query = (email != " ") ? 'SELECT * FROM "Person" WHERE "email" = $1' : 'SELECT * FROM "Person" WHERE "mobilenumber" = $1';
  const queryValues = (email != " ") ? [email] : [number];
  const result = await db.query(query, queryValues);
  if (result.rowCount === 0) return res.status(400).json({ message: "Email or mobile number incorrect!" });
  const isValidPassword = await bcrypt.compare(
    password,
    result.rows[0].password
  );
  if (!isValidPassword) return res.status(400).json({ message: "Password incorrect!" });
  const user = result.rows[0];
  delete user.password;
  console.log("Logged in user: " + user);
  const token = generateUserJwtToken(user).token;
  refreshTokens.push(token);
  var secret = speakeasy.generateSecret(); // Generate secret for 2FA
  var verified = result.rows[0].verified;
  res.status(200).json({ ...user, token, secret, verified });
});

// Route for adding a new user to the database
router.post("/googleAddUser", async (req, res) => {
  try {
    const {id, name, lastname, email, image, password, mobilenumber, role, verified} = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email address" });

    const existingUser = await db.query('SELECT * FROM "Person" WHERE email = $1',[email]);

    if (existingUser.rows.length > 0) {
      const token = generateUserJwtToken(JSON.stringify(existingUser.rows[0])).token;
      console.log("ovo je za existing user token: " + token);
      refreshTokens.push(token);
      let nestaFino = existingUser.rows[0];
      return res
        .status(400)
        .json({ message: "User already exists", token: token, user: nestaFino });
    }
    console.log(password);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("this is verified: " + verified);

    const newUser = await db.query(
      'INSERT INTO "Person" ("id", "name", "lastname", "image", "password", "email", "mobilenumber", "role", "verified") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [id, name, lastname, image, hashedPassword, email, mobilenumber, role || "superAdmin", verified]);

    console.log("OVO JE REZULTAT: " + newUser.rows[0]);
    const token = generateUserJwtToken(JSON.stringify(newUser.rows[0])).token;
    refreshTokens.push(token);

    // Generate secret for 2FA
    const secret = speakeasy.generateSecret();
    console.log("secret generirani: " + secret.otpauth_url);
    console.log(token);

    res.status(201).json({
      message: "User added successfully",
      user: newUser.rows[0],
      token: token,
      secret: secret,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route for logout logic
/*
router.post("/logout", authenticateToken, (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "You are not authenticated!" });
  if (!refreshTokens.includes(token)) return res.status(403).json({ message: "Token is not valid!" });
  refreshTokens = refreshTokens.filter((checkToken) => checkToken !== token);
  res.status(200).json({ message: "Logged out successfully." });
});*/
// Endpoint za odjavu
router.post("/logout", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "You are not authenticated!" });
  const token = authHeader.split(" ")[1];
  // Token koji se odjavljuje je uklonjen iz liste aktivnih tokena
  console.log("Logging out token:", token);
  res.status(200).json({ message: "Logged out successfully." });
});

// Route for 2FA generating data url for QR code
router.post("/2faSetup", (req, res) => {
  const { secret } = req.body;
  QRCode.toDataURL(secret, (err, dataUrl) => {
    if (err) return res.status(500).json({ error: "Error generating QR code" });
    res.json({ dataUrl });
  });
});

// Route for 2FA verify token
router.post("/verify", (req, res) => {
  const { userToken: token, secret } = req.body;
  const baseSecret = secret.base32;
  const verified = speakeasy.totp.verify({
    secret: baseSecret,
    encoding: "base32",
    token
  });
  res.json({ success: verified });
});

module.exports = router;

