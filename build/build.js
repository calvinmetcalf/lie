#!/usr/bin/env node
var fs = require("fs");
var UglifyJS = require("uglify-js");
var path = "dist/";

fs.readFile("promiscuous.js", "utf8",function(err,cr){
  var copyright = cr.match(/.*\n/)[0];
  var minified = copyright + UglifyJS.minify("promiscuous.js").code;
  fs.exists(path,function(exists){
    if(!exists){
      fs.mkdir(path,function(){
        fs.writeFile(path + "promiscuous.js",minified,function(){console.log("done")});
      });
    }else{
      fs.writeFile(path + "promiscuous.js",minified,function(){console.log("done")});
    }
  });
});

