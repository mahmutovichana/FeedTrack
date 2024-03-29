const router = require("express").Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const db = require("../db");

router.get("/dashboard", authenticateToken, (req, res) => {
  res.status(200).json(req.user);
});

router.get("/branches", async (req, res) => {
  const result = await db.query('SELECT * FROM "Branch"');

  res.status("200").json(result.rows);
});

module.exports = router;