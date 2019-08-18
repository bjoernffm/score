const score = require("../../score.js");
const express = require("express");
const router = express.Router();

let mysql = require("mysql");
let pool  = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

router.post("/:rulesetId/scores", function (req, res) {
    pool.query("SELECT *  FROM `rulesets` WHERE `id` = ?", [req.params.rulesetId], function (error, results, fields) {
        if (error) {
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }

        if (results.length <= 0) {
            res.status(404).json({ error: "NOT_FOUND" });
        } else {
            let rules = JSON.parse(results[0].rules);
            let context = req.body;

            score.calculate(rules, context)
                .then((score) => {
                    res.json({
                        "request_id": req.id,
                        "took": ((new Date())-req.startTime),
                        "data": results
                    });
                });
        }
    });
});

module.exports = router;
