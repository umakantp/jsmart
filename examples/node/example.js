/**
 * Example show jSmart can be used in Node.js
 */

var fs = require('fs'),
    path = require('path'),
    jSmart = require('jSmart');

var tpl = fs.readFileSync(path.normalize(__dirname+'/hello.tpl'), {encoding: 'utf-8'});

var compiledTemplate = new jSmart(tpl);

console.log(compiledTemplate.fetch({name: "Umakant Patil"}));
