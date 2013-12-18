/*
 * Executes test {javascript} tag.
 */

var common = require('./test-common.js'),
    path = require('path'),
    fs = require('fs');


GLOBAL.filterTest = function () {
    return "FILTER_TEST";
}
var t = new jSmart(common.getTemplateData('javascript'));
var res = t.fetch(common.getData());
var txt = fs.readFileSync(path.normalize(__dirname+'/../templates/javascript_result.txt'), {encoding: 'utf-8'});
if (res == txt) {
    console.log('test javascript :: okay');
} else {
    console.log('test javascript :: failed');
}
