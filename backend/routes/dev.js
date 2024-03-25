const router = require("express").Router();
const con = require("../api/db");

router.get("/tables", (req, res) => {
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

module.exports = router;
