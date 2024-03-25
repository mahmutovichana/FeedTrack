const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

require("dotenv").config();
const app = express();

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "FeedTrack API",
      version: "1.0.0",
    },
  },
  apis: ["./api/*.js"],
};

const openapiSpecification = swaggerJsdoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openapiSpecification));

// Development/production constants
const PORT = process.env.PORT || 3000;
const URL = process.env.BACKEND_URL || "http://localhost:3000";
const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "FeedTrackAccessToken";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "FeedTrackRefreshToken";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  multipleStatements: true,
});

con.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL database:", error);
  } else {
    console.log("Connected to MySQL database!");
  }
});

let refreshTokens = [];

/**
 * @swagger
 * /api/token:
 *  post:
 *    summary: Refresh JWT access token
 *    description: Get a new access token by passing refresh token in the request body
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
 *                type: string
 *            example:
 *              refreshToken: eyJhbGciOi...sOeF7OuJMZs
 *    responses:
 *      "200":
 *        description: New access token
 *        content:
 *          application/json:
 *            schema:
 *              accessToken:
 *                type: string
 *            example:
 *              accessToken: eyJhbGciOi...sOeF7OuJMZs
 *      "401":
 *        description: Not authenticated
 *      "403":
 *        description: Invalid refresh token
 */
app.post("/api/token", (req, res) => {
  const refreshToken = req.body.refreshToken;

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

/**
 * @swagger
 * /api/login:
 *  post:
 *    summary: User login
 *    description: Get new access and refresh tokens for successful login
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *            example:
 *              email: example@etf.unsa.ba
 *              password: pass123
 *    responses:
 *      "200":
 *        description: Logged in successfully
 *        content:
 *          application/json:
 *            schema:
 *              id:
 *                type: number
 *              username:
 *                type: string
 *              email:
 *                type: string
 *              accessToken:
 *                type: string
 *              refreshToken:
 *                type: string
 *            example:
 *              id: 1
 *              username: user123
 *              email: example@etf.unsa.ba
 *              accessToken: eyJhbGciOi...sOeF7OuJMZs
 *              refreshToken: asdsadsad...sOeF7asduJMZs
 *      "400":
 *        description: Incorrect email or password
 */
app.post("/api/login", (req, res) => {
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

/**
 * @swagger
 * /api/logout:
 *  post:
 *    summary: User logout
 *    description: Logout current user by providing access token in the request body
 *    requestBody:
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              accessToken:
 *                type: string
 *            example:
 *              accessToken: eyJhbGciOi...sOeF7OuJMZs
 *    responses:
 *      "200":
 *        description: Logged out successfully
 */
app.post("/api/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.status(200).json({ message: "Logged out successfully." });
});

/**
 * @swagger
 * /api:
 *  get:
 *    summary: User dashboard
 *    description: Authenticated users can view the dashboard
 *    parameters:
 *    - in: header
 *      name: authorization
 *      schema:
 *        properties:
 *        authorization:
 *          type: string
 *        required: true
 *      description: Access token for user that's logged in
 *      example:
 *        authorization: Bearer eyJhbGciOi...sOeF7OuJMZs
 *    responses:
 *      "200":
 *        description: A successful response
 *      "401":
 *        description: Not authenticated
 *      "403":
 *        description: Invalid refresh token
 */
app.get("/api", authenticateToken, (req, res) => {
  res.status(200).json(req.user);
});

app.get("/api/branches", (req, res) => {
  con.query("SELECT * FROM Branch", (error, results) => {
    if (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ error: "Error fetching branches" });
    } else {
      console.log("Branches:", results);
      res.json(results);
    }
  });
});

app.get("/api/tables", (req, res) => {
  const tables = ["Branch", "Feedback", "Person", "Report", "Teller"];

  const sql = tables.map((name) => `SELECT * FROM ${name}`).join(";");

  con.query(sql, (err, results) => {
    if (err) throw err;

    const html = results
      .map((table, index) => {
        let html = `<h1>${tables[index]}</h1><table border="1">`;

        html += `<tr><th>#</th>`;
        Object.keys(table[0]).forEach((key) => {
          html += `<th>${key}</th>`;
        });
        html += "</tr>";

        table.forEach((row, index) => {
          html += `<tr><td>${index + 1}</td>`;
          Object.values(row).forEach((item) => {
            html += `<td>${item}</td>`;
          });
          html += "</tr>";
        });

        return html + "</table>";
      })
      .join("");

    res.send(html);
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(401).json("You are not authenticated!");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.status(403).json("Token is not valid!");
    }

    req.user = user;
    next();
  });
}

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, {
    expiresIn: "30m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET);
}

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
