const approuter = require("@sap/approuter");
const jwtDecode = require("jwt-decode");
let ar = approuter();
ar.beforeRequestHandler.use((req, res, next) => {
    console.log("the following request was made");
    console.log("Method", req.method);
    console.log("url", req.url);
    next();
});

require("@sap/xsenv").loadEnv();
ar.beforeRequestHandler.use("/getAppVariables", (req, res) => {
    if (process.env.appid == null) {
        res.statusCode = 403;
        res.end("Missing Appid");
    }
    res.end(JSON.stringify(process.env.appid));
});

ar.beforeRequestHandler.use("/getUserInfo", (req, res) => {
    if (!req.user) {
        res.statusCode = 403;
        res.end("Missing JWT Token");
    }
    res.statusCode = 200;
    let decodedJWTToken = jwtDecode(req.user.token.accessToken);
    res.end(JSON.stringify({
        decodedJWTToken
    }));
});

ar.start();