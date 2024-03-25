const router = require("express").Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const con = require("../api/db");

router.get("/dashboard", authenticateToken, (req, res) => {
  res.status(200).json(req.user);
});

router.get("/branches", (req, res) => {
  con.query("SELECT * FROM Branch", (err, results) => {
    if (err) {
      return res.status(500).json({ err: "Error fetching branches" });
    }

    res.status("200").json(results);
  });
});

module.exports = router;
