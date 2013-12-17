/*
 * Executes test cases default modifiers.
 */

var common = require('./test-common.js'),
    path = require("path");


GLOBAL.filterTest = function () {
    return "FILTER_TEST";
}

jSmart.prototype.left_delimiter = '<!--{';
jSmart.prototype.right_delimiter = '}-->';
jSmart.prototype.auto_literal = false;

var t = new jSmart(common.getTemplateData('escape_parsing'));

var res = t.fetch({a: ['0','1','2','3','4','5','6','7','8','9'], foo: 'bar'});

common.test('escapeParsing', res, path.normalize(__dirname+'/../php/test-escapeParsing.php'));
