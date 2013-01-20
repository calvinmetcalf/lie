#!/usr/bin/env node
var fs = require("fs");
var UglifyJS = require("uglify-js");

var minified = UglifyJS.minify("promiscuous.js", {
  output: { comments: true }
}).code;

var path = "dist/";
if(!fs.existsSync(path))
  fs.mkdirSync(path);

fs.writeFileSync(path + "promiscuous-node.js",
                 minified);
fs.writeFileSync(path + "promiscuous-browser.js",
                 minified.replace("module.exports", "window.promiscuous")
                         .replace("process.nextTick", "setTimeout"));
