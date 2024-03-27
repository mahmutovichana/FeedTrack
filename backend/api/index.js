const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");

const swaggerUI = require("swagger-ui-express");
const swaggerJson = require("./swagger.json");
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
const customCss =
  ".swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }";

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
  swaggerUI.setup(null, {
    customCss,
    customCssUrl: CSS_URL,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", authRouter);
app.use("/api", devRouter);
app.use("/api", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
