const score = require("../score.js");
const assert = require("assert");

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

describe("Score", function() {
    describe("#applyMethod", function() {
        it("should add if the method is 'add'", function() {
            assert.equal(score.applyMethod(2, "add", 1), 3);
            assert.equal(score.applyMethod(2, "add", 10), 12);
            assert.equal(score.applyMethod(10, "add", -2), 8);
            assert.equal(score.applyMethod(10, "add", 0), 10);
            assert.equal(score.applyMethod(10, "add", 0), 10);
        });

        it("should subtract if the method is 'subtract'", function() {
            assert.equal(score.applyMethod(2, "subtract", 1), 1);
            assert.equal(score.applyMethod(2, "subtract", 10), -8);
            assert.equal(score.applyMethod(10, "subtract", -2), 12);
            assert.equal(score.applyMethod(10, "subtract", 0), 10);
        });

        it("should multiply if the method is 'multiply'", function() {
            assert.equal(score.applyMethod(2, "multiply", 1), 2);
            assert.equal(score.applyMethod(2, "multiply", 5), 10);
            assert.equal(score.applyMethod(10, "multiply", -2), -20);
            assert.equal(score.applyMethod(10, "multiply", 0), 0);
        });

        it("shouldn't do anything if the method is 'idle'", function() {
            assert.equal(score.applyMethod(2, "idle", null), 2);
        });

        it("should react to bad arguments", function() {
            expect(() => score.applyMethod(10)).to.throw(Error, "Unknown method or value");
            expect(() => score.applyMethod(10, "add")).to.throw(Error, "Unknown method or value");
            expect(() => score.applyMethod(10, "add", "a")).to.throw(Error, "Unknown method or value");
            expect(() => score.applyMethod(10, "add", null)).to.throw(Error, "Unknown method or value");
            expect(() => score.applyMethod(10, "add", [])).to.throw(Error, "Unknown method or value");
            expect(() => score.applyMethod(10, "lala", 0)).to.throw(Error, "Unknown method or value");
            expect(() => score.applyMethod(10, "idle", 0)).to.throw(Error, "Unknown method or value");
        });
    });


    describe("#calculate", function() {
        let context = {
            age: 36,
            views: 95000,
            created: "2008-05-03T21:04:35Z"
        };
        let rules;

        it("should resolve 1 with the given rule", function() {
            rules = [{
                "condition": "views/(created|weeksUntilNow) > 100",
                "if_true": {
                    "method": "add",
                    "value": 1
                },
                "if_false": {
                    "method": "idle",
                    "value": null
                }
            }];
            return expect(score.calculate(rules, context)).to.eventually.equal(1);
        });

        it("should resolve 3 with the given rules", function() {
            rules = [{
                "condition": "views/(created|weeksUntilNow) > 100",
                "if_true": {
                    "method": "add",
                    "value": 5
                },
                "if_false": {
                    "method": "idle",
                    "value": null
                }
            }, {
                "condition": "age > 100",
                "if_true": {
                    "method": "add",
                    "value": 2
                },
                "if_false": {
                    "method": "subtract",
                    "value": 2
                }
            }];
            return expect(score.calculate(rules, context)).to.eventually.equal(3);
        });

        it("should resolve 0 with the given rules", function() {
            rules = [{
                "condition": "views/(created|weeksUntilNow) > 100",
                "if_true": {
                    "method": "add",
                    "value": 5
                },
                "if_false": {
                    "method": "idle",
                    "value": null
                }
            }, {
                "condition": "age > 100",
                "if_true": {
                    "method": "add",
                    "value": 2
                },
                "if_false": {
                    "method": "break",
                    "value": null
                }
            }];
            return expect(score.calculate(rules, context)).to.eventually.equal(0);
        });

        it("should resolve 0 with the given rules", function() {
            rules = [{
                "condition": "views/(created|weeksUntilNow) > 100",
                "if_true": {
                    "method": "break",
                    "value": null
                },
                "if_false": {
                    "method": "idle",
                    "value": null
                }
            }, {
                "condition": "age > 100",
                "if_true": {
                    "method": "add",
                    "value": 2
                },
                "if_false": {
                    "method": "break",
                    "value": null
                }
            }];
            return expect(score.calculate(rules, context)).to.eventually.equal(0);
        });

        it("should reject when wrong expression given", function() {
            rules = [{
                "condition": "views",
                "if_true": {
                    "method": "break",
                    "value": null
                },
                "if_false": {
                    "method": "idle",
                    "value": null
                }
            }];
            return expect(score.calculate(rules, context)).to.eventually.rejectedWith(Error, "Unknown result '95000' for expression 'views'");
        });

        it("should reject when wrong expression given", function() {
            rules = [{
                "condition": "views > 1",
                "if_true": {
                    "method": "add",
                    "value": null
                },
                "if_false": {
                    "method": "idle",
                    "value": null
                }
            }];
            return expect(score.calculate(rules, context)).to.eventually.rejectedWith(Error, "Unknown method or value");
        });

        it("should reject when wrong expression given", function() {
            rules = [{
                "condition": "views > 1",
                "if_true": {
                    "method": "not_available",
                    "value": 10
                },
                "if_false": {
                    "method": "idle",
                    "value": null
                }
            }];
            return expect(score.calculate(rules, context)).to.eventually.rejectedWith(Error, "Unknown method or value");
        });
    });
});