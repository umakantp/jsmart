/*
 * Executes all test cases.
 */

require('../jsmart.js');

var fs = require('fs');

var exec = require('child_process').exec;

function getTemplateData(fileName, hasExt) {
    var fname;
    if (fileName.indexOf('/templates/') > -1) {
        fname = fileName;
    } else {
        fname =__dirname + '/templates/'+fileName;
    }
    if (!hasExt) {
        fname += '.tpl';
    }
    return fs.readFileSync(fname, {encoding: 'utf-8'});
}

function getData()
{
    return {
	'foo' : 'bar',
	'a' : ['0','1','2','3','4','5','6','7','8','9'],
	'a2' : ['0',{baz:'baz'}],
	'o' : { '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9' },
	'ob' : {
	    'prop1': 'prop1',
	    'prop2': { 'txt':'txt', 'num':777, 'bool_true': 1 }
	},
	'code' : '[{$ob.prop2.txt}]',
	'num': 7,

	'books': [
	    {
                'title'  : 'JavaScript: The Definitive Guide',
	 	'author' : 'David Flanagan',
		'price'  : '31.18'
	    },
	    {
		'title'  : 'Murach JavaScript and DOM Scripting',
		'author' : 'Ray Harris',
		'price' : ''
	    },
	    {
		'title'  : 'Head First JavaScript',
		'author' : 'Michael Morrison',
		'price'  : '29.54'
	    }
	],
	'long_text': "\nfirst paragraph. Second sentence. \nNext paragraph. AAAAA.    Third sentence \n\n\n Third paragraph\n",
	'aEmpty' : [],
	'sEmpty' : '',
	'nullVar': null,
	'textWithHTML': '<span style="color:red;"><i><b>foo</b></i></span>',
    'testPath': (__dirname + '/templates'),
    };
}

jSmart.prototype.getFile = function(tpl) {
    return getTemplateData(tpl, true);
};

jSmart.prototype.getTemplate = function (tpl) {
    return getTemplateData(tpl, true);
};

jSmart.prototype.registerPlugin(
    'function',
    'isEmptyStr',
    function (params, data) {
        return (params.s.length == 0);
    }
);

jSmart.prototype.registerPlugin(
    'function',
    'sayHello',
    function (params, data) {
        var s = 'Hello ';
            s += params.to;
        return s;
    }
);

jSmart.prototype.registerPlugin(
    'function',
    'strayFunc',
    function (v1, v2) {
        return v1+','+v2;
    }
);

jSmart.prototype.registerPlugin(
    'function',
    'strayNoArgs',
    function () {
        return 'bar';
    }
);

function test(fileName) {
    exec(__dirname+'/../../php/bin/php '+__dirname+'/test.php '+fileName, function(error, stdout, stderr) {
        if (error == null) {
            checkAgainst_jSmart(fileName, stdout);
        } else {
            console.log('Error getting data from PHP');
            console.log(error);
            console.log(stderr);
            console.log(stdout);
            process.exit(1);
        }
    });
}

function checkAgainst_jSmart(fileName, phpOutput) {
    var tpl = getTemplateData(fileName);
    var t = new jSmart(tpl);
    var res = t.fetch(getData());

    if (process.argv[2] == "php" && process.argv[3] == fileName) {
        console.log(phpOutput);
    } else if (process.argv[2] == "js" && process.argv[3] == fileName) {
        console.log(res);
    }

    if (res == phpOutput) {
        console.log('test '+fileName+':: okay');
    } else {
        console.log('test '+fileName+':: FAILED');
        process.exit(1);
    }
}

test('append');
test('assign');
test('call');
test('capture');
//test('child1');
//test('child2');
test('comments');
//test('config_load');
test('counter');
test('cycle');
//test('default_modifiers.tpl');
test('escape_html');
//test('escape_parsing');
test('eval');
test('examples');
test('fetch');
//test('filtered');
//test('filters');
test('for');
test('foreach');
//test('function');
test('html_checkboxes');
test('html_image');
test('html_options');
test('html_radios');
test('html_table');
test('if');
//test('include');
//test('include_php'); @deprecated
//test('included');
//test('included2');
//test('insert');
//test('javascript');
test('literal');
//test('mailto');
//test('main');
//test('math');
//test('modifiers');
//test('parent');
//test('php');
//test('phpjs');
//test('plugins');
//test('rldelim');
test('section');
//test('setfilter');
test('strip');
//test('textformat');
//test('var');
test('while');
