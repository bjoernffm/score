require("dotenv").config();

const score = require("./score.js");
const uuidv4 = require("uuid/v4");
const express = require("express");
const app = express();

app.use(require("body-parser").json());

app.use("/api", require("./middleware/request.js"));
app.use("/api/rulesets", require("./middleware/routers/rulesets.js"));
app.use("/api/rulesets", require("./middleware/routers/scores.js"));

app.listen(
    process.env.APP_PORT,
    () => console.log(`Example app listening on port ${process.env.APP_PORT}!`)
);
