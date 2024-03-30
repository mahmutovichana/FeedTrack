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