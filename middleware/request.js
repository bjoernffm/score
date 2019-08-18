const fs = require("fs");
const jwt = require("jsonwebtoken");
const uuidv4 = require("uuid/v4");

/*var jwt = require("jsonwebtoken");
var privateKey = fs.readFileSync(".keys/private.pem");
jwt.sign({ user_id: 1 }, privateKey, { algorithm: "RS256" }, function(err, token) {
  console.log(token);
  var cert = fs.readFileSync(".keys/public.pem");  // get public key
    jwt.verify(token, cert, { algorithms: ["RS256"] }, function(err, decoded) {
        console.log(err);
      console.log(decoded) // bar
    });
});*/

let checkJWT = function(request) {
    return new Promise((resolve, reject) => {
        if (request.get("Authorization") !== undefined) {
            let token = request.get("Authorization").split(" ");

            if (token.length == 2 && token[0] == "Bearer") {
                const cert = fs.readFileSync(".keys/public.pem");  // get public key
                jwt.verify(token[1], cert, { algorithms: ["RS256"] }, (jwtError, jwtDecoded) => {

                    if (jwtError === null && jwtDecoded !== undefined) {
                        resolve(jwtDecoded);
                    } else {
                        reject(new Error("Bearer token not acceptable"));
                    }
                });
            } else {
                reject(new Error("Authorization Bearer token not available"));
            }
        } else {
            reject(new Error("No Authorization header available"));
        }
    });
};

let request = function(req, res, next) {
    if (req.accepts("application/json") === false) {
        res.status(406).json({ error: "NOT_ACCEPTABLE" });
        return;
    }

    checkJWT(req)
        .then((jwtDecoded) => {
            req.id = uuidv4();
            req.startTime = new Date();
            req.jwt = jwtDecoded;
            next();
        })
        .catch((error) => {
            res.status(401).json({ error: "UNAUTHORIZED", message: error });
        });
};

module.exports = request;
