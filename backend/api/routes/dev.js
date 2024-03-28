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

module.exports = router;