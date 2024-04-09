const jwt = require("jsonwebtoken");

// function to check the provided token is it valid
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  if (!authHeader) return res.status(401).json({ message: "You are not authenticated!" });
  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    "FeedTrackAccessToken",
    (err, decodedToken) => {
      console.log(decodedToken);
      if (err) return res.status(403).json({ message: "Token is not valid!" });
      const extendedToken = jwt.sign(
        { ...decodedToken, exp: decodedToken.exp + 30 * 60 },
        "FeedTrackAccessToken"
        );
        req.headers["authorization"] = `Bearer ${extendedToken}`;
        req.decodedToken = decodedToken;
        next();
      });
}

// function to check if the user with this role is auth to do or view specific things
function authRole(...roles) {
  return (req, res, next) => {
    console.log(req.decodedToken.role);
    if (!roles.includes(req.decodedToken.role)) return res.status(401).json({ message: "Not allowed" });
    next();
  };
}

// function to generate a jwt token for the user
function generateUserJwtToken(user) {
  const expiresIn = "30m";
  const email = user.email, role = user.role;
  console.log(user);
  const token = jwt.sign({email, role}, "FeedTrackAccessToken", {expiresIn});
  console.log(token);
  return {token, user};
}

module.exports = {
  authenticateToken,
  authRole,
  generateUserJwtToken
};
