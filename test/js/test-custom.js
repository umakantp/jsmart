/*
 * Executes test cases like if / foreach / blocks...etc.
 */


var common = require('./test-common.js'),
    path = require("path");

function process(tpl) {
    var t = new jSmart(common.getTemplateData(tpl));
    var res = t.fetch(common.getData());
    common.test(tpl, res, path.normalize(__dirname+'/../php/test-custom.php') + ' ' + tpl);
}

process('custom');

