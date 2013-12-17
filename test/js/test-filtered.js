/*
 * Executes test cases default modifiers.
 */

var common = require('./test-common.js'),
    path = require("path");


GLOBAL.filterTest = function () {
    return "FILTER_TEST";
}

jSmart.prototype.registerFilter('pre',function(s) {return s.replace(/<!--.*-->/g,'changed in PRE filter');});
jSmart.prototype.registerFilter('pre',function(s) {return s.replace(/changed/g,'----------');});
jSmart.prototype.registerFilter('variable',function(s) {return (new String(s)).replace(/FILTER_TEST/g,'changed in VAR filter');});
jSmart.prototype.registerFilter('post',function(s) {return s.replace(/FILTER_TEST/g,'changed in POST filter');});

var t = new jSmart(common.getTemplateData('filtered'));

var res = t.fetch({t: 'test', foo: 'FILTER_TEST'});

common.test('filtered', res, path.normalize(__dirname+'/../php/test-filtered.php'));
