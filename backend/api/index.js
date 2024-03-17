import express from "express";
import cors from "cors";
const app = express();

app.use(cors());

app.get("/api", (req, res) => {
    res.json({ name: "Hana" }); // Šalje odgovor u JSON formatu s imenom
});

app.listen(3000, () => console.log("Server ready on port 3000."));
