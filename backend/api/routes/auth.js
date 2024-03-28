const router = require("express").Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode'); 
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));


let refreshTokens = [];

router.post("/token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Token is not valid!" });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, userData) => {
      if (err) {
        return res.status(403).json({ message: "Token is not valid!" });
      }

      const user = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
      };
      const accessToken = generateAccessToken(user);

      res.status(200).json({ accessToken });
    }
  );
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query('SELECT * FROM "Person" WHERE email = $1', [
    email,
  ]);

  if (result.rowCount === 0) {
    return res.status(400).json({ message: "Email or password incorrect!" });
  }

  const isValidPassword = await bcrypt.compare(
    password,
    result.rows[0].password
  );

  if (!isValidPassword) {
    return res.status(400).json({ message: "Email or password incorrect!" });
  }

  const { id, username, email: userEmail } = result.rows[0];
  const user = { id, username, email: userEmail };

  // Generate access and refresh tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.push(refreshToken);

  // Generate secret for 2FA
  const secret = speakeasy.generateSecret();
  console.log("secret generirani: " + secret.otpauth_url);
  res.status(200).json({
    ...user,
    accessToken,
    refreshToken,
    secret
  });
});

router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Token is not valid!" });
  }

  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

  res.status(200).json({ message: "Logged out successfully." });
});

router.post('/twofactorsetup', (req, res) => {
  const secret  = req.body.secret;
  QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) {
      return res.status(500).json({ error: 'Error generating QR code' });
    }
    res.json({ dataUrl: data_url });
  });
});

// verify 2fa
router.post('/verify', (req, res) => {
  const token = req.body.userToken;
  const secret = req.body.secret;
  const verified = speakeasy.totp.verify({secret: secret.base32, encoding: 'base32', token: token});
  res.json({success: verified});
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = router;
