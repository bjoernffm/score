const jexl = require('jexl');

jexl.addTransform('lower', (val) => val.toLowerCase());
jexl.addTransform('weeksUntilNow', (val) => {
    return Math.floor(((new Date())-(new Date(val)))/592200000);
});

exports.applyMethod = function(score, method, value) {
    if (method == 'add' && typeof value == 'number') {
        score += value;
    } else if (method == 'subtract' && typeof value == 'number') {
        score -= value;
    } else if (method == 'multiply' &&  typeof value == 'number') {
        score *= value;
    } else if (method == 'idle') {
        // do nothing
    } else {
        throw new Error("Unknown method or value");
    }

    return score;
};


exports.calculate = function(rules, context) {
    return new Promise((resolve, reject) => {
        let counter = 0;
        let score = 0;

        // iterate through all rules
        for(let i = 0; i < rules.length; i++) {
            jexl.eval(rules[i].condition, context).then((result) => {
                // positive branch
                if (result === true && rules[i].if_true.method != "break") {
                    try {
                        score = exports.applyMethod(score, rules[i].if_true.method, rules[i].if_true.value);
                    } catch (err) {
                        reject(err);
                    }

                // negative branch
                } else if (result === false && rules[i].if_false.method != "break") {

                    try {
                        score = exports.applyMethod(score, rules[i].if_false.method, rules[i].if_false.value);
                    } catch (err) {
                        reject(err);
                    }

                // seems to be method "break"
                } else if ([true, false].includes(result)) {
                    resolve(0);

                // unknown branch
                } else {
                    reject(new Error("Unknown result \""+JSON.stringify(result)+"\" for expression \""+rules[i].condition+"\""))
                }

                counter += 1;
                if (counter == rules.length) {
                    resolve(score);
                }
            });
        }
    });
}
