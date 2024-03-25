const router = require("express").Router();
const jwt = require("jsonwebtoken");
const con = require("../api/db");

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "FeedTrackAccessToken";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "FeedTrackRefreshToken";

let refreshTokens = [];

router.post("/token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json("You are not authenticated!");
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Token is not valid!");
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, userData) => {
    if (err) return res.sendStatus(403);

    const user = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
    };
    const accessToken = generateAccessToken(user);

    res.status(200).json({ accessToken });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  con.query(
    "SELECT * FROM Person WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) throw err;

      if (results.length === 0) {
        return res.status(400).json("Email or password incorrect!");
      }

      const { id, username, email } = results[0];
      const user = { id, username, email };

      // Generate access and refresh tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);

      res.status(200).json({
        ...user,
        accessToken,
        refreshToken,
      });
    }
  );
});

router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json("You are not authenticated!");
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Token is not valid!");
  }

  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

  res.status(200).json({ message: "Logged out successfully." });
});

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, {
    expiresIn: "30m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET);
}

module.exports = router;
