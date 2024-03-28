const router = require("express").Router();
const db = require("../db");

router.get("/tables", async (req, res) => {
    const tables = ['"Branch"', '"Feedback"', '"Person"', '"Report"', '"Teller"'];

    const sql = tables.map((name) => `SELECT * FROM ${name}`).join(";");

    const result = await db.query(sql);

    const html = result
        .map(({ rows }, index) => {
            let html = `<h1>${tables[index]}</h1><table border="1">`;

            html += `<tr><th>#</th>`;
            Object.keys(rows[0]).forEach((key) => {
                html += `<th>${key}</th>`;
            });
            html += "</tr>";

            rows.forEach((row, index) => {
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

// Route for adding a new user to the database
router.post("/addUser", async (req, res) => {
    try {
        const { id, name, lastName, username, password, email, mobileNumber, role } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email address" });

        const existingUser = await db.query('SELECT * FROM "Person" WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.query(
            'INSERT INTO "Person" ("id", "name", "lastName", "username", "password", "email", "mobileNumber", "role") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id, name, lastName, username, hashedPassword, email, mobileNumber, role || "superAdmin"]
        );

        res.status(201).json({ message: "User added successfully", user: newUser.rows[0] });
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Route for getting the maximum user ID from the database
router.get("/getMaxUserId", async (req, res) => {
    try {
        const result = await db.query('SELECT MAX(id) AS maxId FROM "Person"');
        const maxId = parseInt(result.rows[0].maxid) || -1;
        res.json({ maxId });
    } catch (error) {
        console.error("Error fetching max user ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;