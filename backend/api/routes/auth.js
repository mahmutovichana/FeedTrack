const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

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

  res.status(200).json({
    ...user,
    accessToken,
    refreshToken,
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

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = router;
