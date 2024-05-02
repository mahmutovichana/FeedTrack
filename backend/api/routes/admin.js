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

router.post("/:dataType", async (req, res) => {
  const { dataType } = req.params;
  const { image, message } = req.body;
  const dataTables = {
    welcomeData: "WelcomeData",
    thankYouData: "ThankYouData"
  };

  if (!dataTables[dataType] || (!message && !image) || (image && !isBase64(image, { mimeRequired: true }))) {
    return res.status(400).json({ message: (!message && !image) ? "Message or image is required" : (image && !isBase64(image, { mimeRequired: true })) ? "File needs to be an image" : "Invalid data" });
  }

  try {
    console.log("usla u try");
    // Provjeravamo da li postoji red u bazi
    const existingData = await db.query(`SELECT * FROM "${dataTables[dataType]}"`);

    let query = '';
    let values = [];

    // Ako ne postoji red, izvršavamo INSERT
    if (existingData.rowCount === 0) {
      console.log("saznala da nema nista u bazi");
      query = `INSERT INTO "${dataTables[dataType]}" (message, image) VALUES ($1, $2) RETURNING *`;
      values = [message || null, image || null];
    } else {
      // Ako postoji red, izvršavamo UPDATE
      if (message && image) {
        query = `UPDATE "${dataTables[dataType]}" SET message = $1, image = $2 RETURNING *`;
        values = [message, image];
      } else if (message) {
        query = `UPDATE "${dataTables[dataType]}" SET message = $1 RETURNING *`;
        values = [message];
      } else if (image) {
        query = `UPDATE "${dataTables[dataType]}" SET image = $1 RETURNING *`;
        values = [image];
      } else {
        return res.status(400).json({ message: "Either message or image is required" });
      }
    }
    console.log(query);
    const newData = await db.query(query, values);
    res.status(200).json({ message: "Data uploaded successfully", data: newData.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Error uploading ${dataType} data` });
  }
});

router.get("/:dataType", async (req, res) => {
  const { dataType } = req.params;

  const dataTables = {
    welcomeData: "WelcomeData",
    thankYouData: "ThankYouData"
  };

  if (!dataTables[dataType]) {
    return res.status(400).json({ message: "Invalid data type" });
  }

  try {
    const { rows } = await db.query(`SELECT * FROM "${dataTables[dataType]}"`);

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error while retrieving ${dataType} data` });
  }
});

router.delete("/:dataType", async (req, res) => {
  const { dataType } = req.params;

  const dataTables = {
    welcomeData: "WelcomeData",
    thankYouData: "ThankYouData"
  };

  if (!dataTables[dataType]) {
    return res.status(400).json({ message: "Invalid data type" });
  }

  try {
    const { rows } = await db.query(`DELETE FROM "${dataTables[dataType]}"`);

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error while deleting ${dataType} data` });
  }
});

module.exports = router;
