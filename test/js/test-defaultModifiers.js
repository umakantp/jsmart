/*
 * Executes test cases default modifiers.
 */

var common = require('./test-common.js'),
    path = require("path");

jSmart.prototype.addDefaultModifier(["replace:'text_to_replace':'replaced'", 'escape:"htmlall"']);

var t = new jSmart(common.getTemplateData('default_modifiers'));

var res = t.fetch({replace_me: '<b>text_to_replace</b>'});

common.test('defaultModifiers', res, path.normalize(__dirname+'/../php/test-defaultModifiers.php'));
