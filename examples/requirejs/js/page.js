
define(['text!t/subtemplate.html'], function (tpl) {

    jSmart.prototype.addDefaultModifier(['escape']);

    var t = new jSmart(tpl);
    document.getElementById('output').innerHTML = t.fetch({'name': 'Umakant'});
});
