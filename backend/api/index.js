import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/api", (req, res) => {
    res.json({ name: "Hana" }); 
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
