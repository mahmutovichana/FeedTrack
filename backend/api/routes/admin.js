const router = require("express").Router();
const bcrypt = require("bcryptjs");
const isBase64 = require("is-base64");
const {
  authenticateToken,
  authRole,
} = require("../middlewares/authMiddleware");
const db = require("../db");

router.post(
  "/admin",
  authenticateToken,
  authRole("superAdmin"),
  async (req, res) => {
    const { name, lastName, email, image, password, mobileNumber, role } =
      req.body;

    const adminRoles = ["tellerAdmin", "branchAdmin"];

    const newAdminInfo = [
      name,
      lastName,
      image,
      password,
      email,
      mobileNumber,
      role,
    ];

    if (newAdminInfo.some((info) => !info)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await db.query(
      'SELECT * FROM "Person" WHERE email = $1',
      [email]
    );

    if (existingUser.rowCount !== 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!adminRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    newAdminInfo.password = await bcrypt.hash(password, 10);

    try {
      const maxId = await db.query('SELECT MAX(id) AS maxId FROM "Person"');
      const newId = parseInt(maxId.rows[0].maxid) + 1;

      const result = await db.query(
        'INSERT INTO "Person" ("id", "name", "lastName", "image", "password", "email", "mobileNumber", "role") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [newId, ...newAdminInfo]
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    res.status(200).json({ message: "Admin successfully created." });
  }
);

// route for fetching users in users.tsx in case a branchAdmin or tellerAdmin is logged in
// only users with 'user' role are fetched
router.get(
  "/userRoles",
  // authenticateToken,
  // authRole("branchAdmin", "tellerAdmin"),
  async (req, res) => {
    const query = `SELECT * FROM "Person" WHERE role = 'user'`;
    try {
      const { rows } = await db.query(query);
      res.status(200).json(rows);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching users" });
    }
  }
);

router.post("/welcomeData", async (req, res) => {
  const { image, message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  if (!image) {
    return res.status(400).json({ message: "Image is required" });
  }

  if (!isBase64(image, { mimeRequired: true })) {
    return res.status(400).json({ message: "File needs to be image" });
  }

  try {
    const existingData = await db.query('SELECT * FROM "WelcomeData"');

    if (existingData.rowCount !== 0) {
      await db.query('DELETE FROM "WelcomeData"');
    }

    const { rows } = await db.query(
      'INSERT INTO "WelcomeData" (image, message) VALUES ($1, $2) RETURNING *',
      [image, message]
    );

    res.status(200).json({ message: "File and message uploaded successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error uploading welcome data" });
  }
});

router.get("/welcomeData", async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM "WelcomeData"');

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error while retrieving welcome data" });
  }
});

module.exports = router;
