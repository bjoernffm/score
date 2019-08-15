const jexl = require("jexl");

jexl.addTransform("lower", (val) => val.toLowerCase());
jexl.addTransform("weeksUntilNow", (val) => {
    let seconds = ((new Date())-(new Date(val)))/1000;
    let days = seconds/86400;
    let weeks = days/7;
    return Math.floor(weeks);
});

exports.applyMethod = function(score, method, value) {
    if (typeof value === "number") {
        if (method === "add") {
            return score += value;
        } else if (method === "subtract") {
            return score -= value;
        } else if (method === "multiply") {
            return score *= value;
        }
    } else if (method === "idle") {
        return score;
    }

    throw new Error("Unknown method or value");
};


exports.calculate = function(rules, context) {
    return new Promise((resolve, reject) => {
        let counter = 0;
        let score = 0;

        // iterate through all rules
        for(let i = 0; i < rules.length; i++) {
            let rule = rules[i];

            jexl.eval(rule.condition, context).then((result) => {
                // positive branch
                if (result === true && rule.if_true.method !== "break") {
                    try {
                        score = exports.applyMethod(score, rule.if_true.method, rule.if_true.value);
                    } catch (err) {
                        reject(err);
                    }

                // negative branch
                } else if (result === false && rule.if_false.method !== "break") {

                    try {
                        score = exports.applyMethod(score, rule.if_false.method, rule.if_false.value);
                    } catch (err) {
                        reject(err);
                    }

                // seems to be method "break"
                } else if ([true, false].includes(result)) {
                    resolve(0);

                // unknown branch
                } else {
                    reject(new Error("Unknown result '"+JSON.stringify(result)+"' for expression '"+rule.condition+"'"));
                }

                counter += 1;
                if (counter === rules.length) {
                    resolve(score);
                }
            });
        }
    });
};
