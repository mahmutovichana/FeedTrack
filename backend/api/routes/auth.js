const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");
const fs= require("fs");
const os= require("os");
const { generateUserJwtToken } = require("./../middlewares/authMiddleware");
const { authenticateToken } = require("./../middlewares/authMiddleware");

let refreshTokens = [];

router.post("/token", (req, res) => {
  let { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Token is not valid!" });
  }
  /*for rotation we need relation between user and refreshToken in db*/
  /*
  //rotating refreshToken
  //destroying old refreshToken
  const withoutChosen = refreshTokens.filter(function (chosen) {
    return chosen !== refreshToken;
  });

  //generating new refreshToken
  refreshToken = generateRefreshToken(user);
  refreshTokens.push(refreshToken);
  */
  /*make a structure(cookie) where we store user and accessToken so when we call this route
  * we can check if token has expired if so we destroy refreshToken related
  * to it */
  /*
  jwt.verify(cookie.accessToken, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      if(err.name === 'TokenExpiredError'){
        req.body = "";
        refreshTokens=[];
        return res.status(403).json({ message: "Access token expired" });
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
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.push(newRefreshToken);
        const accessToken = generateAccessToken(user);

        res.status(200).json({ accessToken });
      }
  );
    }
  });
  */

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
        const token = generateUserJwtToken(user);

        res.status(200).json({ token });
      }
  );
});

router.post("/login", async (req, res) => {

  let { email, number, password } = req.body;

  if (!email && !number) {
    return res.status(400).json({ message: "Email or mobile number is required!" });
  }

  let query;
  let queryValues;
  if (email!=" ") {
    query = 'SELECT * FROM "Person" WHERE "email" = $1';
    queryValues = [email];
  } else {
    query = 'SELECT * FROM "Person" WHERE "mobileNumber" = $1';
    queryValues = [number];
  }

  console.log(query);
  console.log(queryValues);

  const result = await db.query(query, queryValues);

  console.log(result);

  if (result.rowCount === 0) {
    return res.status(400).json({ message: "Email or mobile number incorrect!" });
  }


  /*
  const { email, password } = req.body;

  const result = await db.query(
      'SELECT * FROM "Person" WHERE email = $1' ,[email,]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({ message: "Email or password incorrect!" });
  }*/

  const isValidPassword = await bcrypt.compare(
      password,
      result.rows[0].password
  );

  if (!isValidPassword) {
    return res.status(400).json({ message: "Password incorrect!" });
  }

  const { id, username, email: userEmail } = result.rows[0];
  const user = { id, username, email: userEmail };

  const token = generateUserJwtToken(user); 

  // Generate access and refresh tokens
  // const accessToken = generateAccessToken(user);
  // const refreshToken = generateRefreshToken(user);
  refreshTokens.push(token);

  console.log(token);

  res.status(200).json({
    ...user,
    token
  });
});

router.post("/logout", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  if (!refreshTokens.includes(token)) {
    return res.status(403).json({ message: "Token is not valid!" });
  }

  refreshTokens = refreshTokens.filter((checkToken) => checkToken !== token);

  /*generate new value for ACCESS_TOKEN_SECRET*/
  //var token = crypto.randomBytes(64).toString('hex');
  /*Change of the ACCESS_TOKEN_SECRET for safety*/
  //setEnvValue("ACCESS_TOKEN_SECRET", token);

  res.status(200).json({ message: "Logged out successfully." });
});
/*
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}
*/

/*function that changes value of variable in .env file*/
/*example setEnvValue("VAR1", "SOMETHING") -> VAR1 = SOMETHING*/
function setEnvValue(key, value) {

  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

  // find the env we want based on the key
  const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
    return line.match(new RegExp(key));
  }));

  // replace the key/value with the new value
  ENV_VARS.splice(target, 1, `${key}=${value}`);

  // write everything back to the file system
  fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));

}

module.exports = router;