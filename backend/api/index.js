const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");

const swaggerUI = require("swagger-ui-express");
const swaggerJson = require("./swagger.json");
const { swagger } = require("./constants");

const authRouter = require("./routes/auth");
const devRouter = require("./routes/dev");
const crudRouter = require("./routes/crud");
const adminRouter = require("./routes/admin");
const branchesRouter = require("./routes/tables/branch");
const campaignsRouter = require("./routes/tables/campaign");
const feedbacksRouter = require("./routes/tables/feedback");
const teaserDataRouter = require("./routes/tables/teaserData");
const viewsRouter = require("./routes/view");

app.use(
    "/api-docs",
    (req, res, next) => {
        req.swaggerDoc = swaggerJson;
        next();
    },
    swaggerUI.serveFiles(),
    swaggerUI.setup(null, {
        customCss: swagger.customCss,
        customCssUrl: swagger.cssUrl,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/*
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});*/

app.use("/api", crudRouter);
app.use("/api", authRouter);
app.use("/api", devRouter);
app.use("/api", adminRouter);
app.use("/api", branchesRouter);
app.use("/api", campaignsRouter);
app.use("/api", viewsRouter);
app.use("/api", feedbacksRouter);
app.use("/api", teaserDataRouter);

const PORT = 5432;

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

module.exports = app;