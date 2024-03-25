const express = require("express");
require("dotenv").config();
const app = express();

const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const authRouter = require("../routes/auth");
const devRouter = require("../routes/dev");
const userRouter = require("../routes/user");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "FeedTrack API",
      version: "1.0.0",
    },
  },
  apis: ["./api/*.js"],
};

const openapiSpecification = swaggerJsdoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openapiSpecification));

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", authRouter);
app.use("/api", devRouter);
app.use("/api", userRouter);

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
