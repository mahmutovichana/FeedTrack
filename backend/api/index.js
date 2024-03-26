const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");

const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
const swaggerJson = require("./swagger.json");

const authRouter = require("./routes/auth");
const devRouter = require("./routes/dev");
const userRouter = require("./routes/user");

app.use(
  "/api-docs",
  (req, res, next) => {
    req.swaggerDoc = swaggerJson;
    next();
  },
  swaggerUI.serveFiles(),
  swaggerUI.setup()
);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", authRouter);
app.use("/api", devRouter);
app.use("/api", userRouter);

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
