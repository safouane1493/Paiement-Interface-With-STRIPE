
const path = require("path");
const express = require("express");
const apiRouter = require("./routes.js");

const app = express();

let p = path.join(__dirname,'../public');
console.log('path ',p);

app.use(express.static(p));
app.use(express.json());
app.use(apiRouter);

const port = process.env.PORT || 8080;
app.listen(port, ()=> console.log('server listening on port :'+ port));



module.exports.app;