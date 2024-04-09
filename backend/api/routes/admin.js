const router = require("express").Router();
const bcrypt = require("bcryptjs");
const {
  authenticateToken, authRole,
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

    const existingUser = await db.query('SELECT * FROM "Person" WHERE email = $1', [email]);

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
  authenticateToken,
  authRole("branchAdmin", "tellerAdmin"),
  async (req, res) => {
    const query = `SELECT * FROM "Person" WHERE role = 'user'`;
    try { 
      const { rows } = await db.query(query); 
      res.status(200).json(rows); 
    }
    catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching users" });
    }
  }
);

module.exports = router;