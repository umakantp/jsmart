
define(['text!t/subtemplate.html', 'jSmart'], function (tpl, Jsmart) {

    jSmart.prototype.addDefaultModifier(['escape']);

    var t = new Jsmart(tpl);
    document.getElementById('output').innerHTML = t.fetch({'name': 'Umakant'});
});
