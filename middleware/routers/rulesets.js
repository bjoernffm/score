const express = require("express");
const router = express.Router();
const Schema = require('validate');

let mysql = require("mysql");
let pool  = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

/*const ruleset = new Schema({
    rules: [{
        name: {
            condition: String,
            required: true
        },
        if_true: {
            value: {
                type: Number,
                required: true
            },
            method: {
                type: String,
                required: true
            }
        },
        if_false: {
            value: {
                type: Number,
                required: true
            },
            method: {
                type: String,
                required: true
            }
        }
    }]
});*/

router.get("/", (req, res, next) => {
    pool.query("SELECT *  FROM `rulesets` WHERE `user_id` = ? AND `deleted_at` IS NULL", [1], function (error, results, fields) {
        if (error) {
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }

        for(let i = 0; i < results.length; i++) {
            results[i].rules = JSON.parse(results[0].rules);
            delete results[i].deleted_at;
            delete results[i].user_id;
        }

        res.json({
            "request_id": req.id,
            "took": ((new Date())-req.startTime),
            "data": results
        });
    });
});

router.get("/:rulesetId", (req, res) => {
    pool.query("SELECT *  FROM `rulesets` WHERE `id` = ? AND `user_id` = ? AND `deleted_at` IS NULL", [req.params.rulesetId, req.jwt.user_id], function (error, results, fields) {
        if (error) {
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }

        if (results.length <= 0) {
            res.status(404).json({ error: "NOT_FOUND" });
        } else {
            results[0].rules = JSON.parse(results[0].rules);
            delete results[0].deleted_at;
            delete results[0].user_id;

            let id = uuidv4();
            let endTime = new Date();

            res.json({
                "request_id": req.id,
                "took": ((new Date())-req.startTime),
                "data": results[0]
            });
        }
    });
});

router.post("/", (req, res) => {
    let errors = ruleset.validate(req.body);

    console.log(errors);
    res.json(errors);

    /*pool.query("SELECT *  FROM `rulesets` WHERE `id` = ? AND `user_id` = ? AND `deleted_at` IS NULL", [req.params.rulesetId, req.jwt.user_id], function (error, results, fields) {
        if (error) {
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }

        if (results.length <= 0) {
            res.status(404).json({ error: "NOT_FOUND" });
        } else {
            results[0].rules = JSON.parse(results[0].rules);
            delete results[0].deleted_at;
            delete results[0].user_id;

            let id = uuidv4();
            let endTime = new Date();

            res.json({
                "request_id": req.id,
                "took": ((new Date())-req.startTime),
                "data": results[0]
            });
        }
    });*/
});

module.exports = router;
