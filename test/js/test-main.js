/*
 * Executes test cases like if / foreach / blocks...etc.
 */


var common = require('./test-common.js'),
    path = require("path");

function process(tpl) {
    var t = new jSmart(common.getTemplateData(tpl));
    var res = t.fetch(common.getData());
    common.test(tpl, res, path.normalize(__dirname+'/../php/test-main.php') + ' ' + tpl);
}

process('append');
process('assign');
process('call');
process('capture');
process('comments');
process('counter');
process('cycle');
process('escape_html');
process('eval');
process('examples');
process('fetch');
process('for');
process('foreach');
process('html_checkboxes');
process('html_image');
process('html_options');
process('html_radios');
process('html_table');
process('if');
process('literal');
process('section');
process('strip');
process('while');
process('parent');
process('child1');
process('function');
//test('include');
//test('include_php'); @deprecated
//test('included');
//test('included2');
//test('insert');
//test('javascript');
//test('mailto');
//test('main');
//test('math');
//process('modifiers');
//process('php');
//process('phpjs');
//process('plugins');
process('rldelim');
process('setfilter');
//process('textformat');
process('var');

