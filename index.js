require("dotenv").config();

const score = require("./score.js");
const uuidv4 = require("uuid/v4");
const express = require("express");
const app = express();

let bodyParser = require("body-parser");
app.use(bodyParser.json());

let mysql = require("mysql");
let pool  = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

app.get("/rulesets/:rulesetId", function (req, res) {
    let startTime = new Date();

    let context = req.body;

    pool.query("SELECT *  FROM `rulesets` WHERE `id` = ?", [req.params.rulesetId], function (error, results, fields) {
        if (error) throw error;

        if (results.length <= 0) {
            res.status(404).json({ error: "NOT_FOUND" });
        } else {
            results[0].rules = JSON.parse(results[0].rules);
            delete results[0].deleted_at;
            delete results[0].user_id;

            let id = uuidv4();
            let endTime = new Date();

            res.json({
                request_id: id,
                took: (endTime-startTime),
                data: results[0]
            });
        }
    });
});

app.post("/rulesets/:rulesetId/scores", function (req, res) {
    let startTime = new Date();

    let context = req.body;

    pool.query("SELECT *  FROM `rulesets` WHERE `id` = ?", [req.params.rulesetId], function (error, results, fields) {
        if (error) throw error;

        if (results.length <= 0) {
            res.status(404).json({ error: "NOT_FOUND" });
        } else {
            let rules = JSON.parse(results[0].rules);

            score.calculate(rules, context)
                .then((score) => {
                    let id = uuidv4();
                    let endTime = new Date();

                    res.json({
                        request_id: id,
                        took: (endTime-startTime),
                        data: {
                            score: score
                        }
                    });
                });
        }
    });
});

app.listen(process.env.APP_PORT, () => console.log(`Example app listening on port ${port}!`))



/*async function f1() {
    let sco = await calculateScore(rules);
    console.log(sco);
    const endTime = new Date();
    console.log(endTime-startTime);
}
f1();*/
