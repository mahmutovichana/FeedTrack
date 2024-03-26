const router = require("express").Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const con = require("../db");

/**
 * @swagger
 * /api/dashboard:
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
