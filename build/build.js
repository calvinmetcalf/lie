#!/usr/bin/env node
var fs = require("fs");
var spawn = require('child_process').spawn;
var path = './dist';
fs.exists(path,function(exists){
   if(!exists){
     fs.mkdir(path,function(){
       makeIt();
     });
   }else{
     makeIt();
   }
});
function makeIt(){
  spawn("./node_modules/uglify-js/bin/uglifyjs", ['promiscuous.js', '--comments', '-o', 'dist/promiscuous.js']);
}