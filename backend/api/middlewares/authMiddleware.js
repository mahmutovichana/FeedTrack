const jwt = require("jsonwebtoken");

// Funkcija za provjeru valjanosti tokena
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Authorization header:", authHeader);
  if (!authHeader) return res.status(401).json({ message: "You are not authenticated!" });
  const token = authHeader.split(" ")[1];
  console.log("Token:", token);
  jwt.verify(
    token,
    "FeedTrackAccessToken",
    (err, decodedToken) => {
      if (err) {
        console.error("Error verifying token:", err);
        return res.status(403).json({ message: "Token is not valid!" });
      }
      console.log("Decoded token:", decodedToken);
      if (!decodedToken) {
        console.error("Decoded token is undefined.");
        return res.status(403).json({ message: "Decoded token is undefined." });
      }
      // Provjera da li je isteklo pola sata od izdavanja tokena
      const currentTime = Math.floor(Date.now() / 1000); // Trenutno vrijeme u sekundama
      console.log("Current time:", currentTime);
      console.log("Token expiry time:", decodedToken.exp);
      console.log("Remaining time until token expiry:", decodedToken.exp - currentTime);
      if (decodedToken.exp < currentTime) {
        console.error("Token has expired.");
        return res.status(403).json({ message: "Token has expired." });
      }
      // Ako je sve u redu, produži trajanje tokena za dodatnih 30 minuta
      const extendedToken = jwt.sign(
        { ...decodedToken, exp: currentTime + 30 * 60 },
        "FeedTrackAccessToken"
      );
      decodedToken.exp = currentTime + 30 * 60;
      console.log("Extended token:", extendedToken);
      req.headers["authorization"] = `Bearer ${extendedToken}`;
      req.decodedToken = decodedToken;
      next();
    }
  );
}

// Funkcija za provjeru ovlasti korisnika
function authRole(...roles) {
  return (req, res, next) => {
    console.log("Decoded token role:", req.decodedToken.role);
    if (!roles.includes(req.decodedToken.role)) return res.status(401).json({ message: "Not allowed" });
    next();
  };
}

// Funkcija za generiranje JWT tokena za korisnika
function generateUserJwtToken(user) {
  const expiresIn = "1m";
  const email = user.email, role = user.role;
  console.log("User:", user);
  const token = jwt.sign({email, role}, "FeedTrackAccessToken", {expiresIn});
  console.log("Generated token:", token);
  return {token, user};
}

module.exports = {
  authenticateToken,
  authRole,
  generateUserJwtToken
};
