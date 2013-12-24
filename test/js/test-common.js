/**
 * Common file required for all test cases.
 */

require('../../jsmart.js');
require('./PHPJS.js');

var fs = require('fs'),
    path = require('path');

function getTemplateData(fileName, hasExt) {
    var fname;
    if (fileName.indexOf('/templates/') > -1) {
        fname = fileName;
    } else {
        fname =__dirname + '/../templates/'+fileName;
    }
    if (!hasExt) {
        fname += '.tpl';
    }
    return fs.readFileSync(fname, {encoding: 'utf-8'});
}


function getData(){
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
        'textWithHTMLEntities': 'Germans use &quot;&Uuml;mlauts&quot; and pay in euro',
        'testPath': path.normalize(__dirname + '/../templates'),
        'testClassObj': new TestClassObj,
    };
}

function test(testFor, nodeOutput, phpFile) {
    var exec = require('child_process').exec;
    exec(path.normalize(__dirname+'/../../../php/bin/php')+' '+phpFile, function(error, phpOutput, stderr) {
        if (error == null) {
            if (phpOutput == nodeOutput) {
                console.log('test '+testFor+':: okay');
            } else {
                console.log('test '+testFor+':: FAILED');
                process.exit(1);
            }
        } else {
            console.log('Error getting data from PHP');
            console.log('------------');
            console.log(phpFile);
            console.log('------------');
            console.log(error);
            console.log('------------');
            console.log(stderr);
            console.log('------------');
            console.log(phpOutput);
            console.log('------------');
            process.exit(1);
        }
    });
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

var i = 0;
jSmart.prototype.registerPlugin(
    'block',
    'testRepeat',
    function(params, content, data, repeat)
    {
        if (!content && 'hide' in params && params['hide'] == true)		//it's opening tag and if 'hide' than forbid further displaying
        {
            repeat.value = false;
        }
        if (content)		//closing tag
        {
            if (++i<3)
            {
                repeat.value = true;
            }
            else
            {
                i = 0;
            }
            return '[' + content + ']';
        }
    }
);

jSmart.prototype.registerPlugin(
    'block',
    'replaceStr',
    function(params, content, data, repeat)
    {
        return content.replace(new RegExp(params['from'],'g'), params['to']);
    }
);


jSmart.prototype.getJavascript = function(name) {
    if (name == '/test_insert.php')
    {
        return document.getElementById('test_insert').innerHTML;
    }
    //var code = "$this.$testVar = {'a':'abcd','b':'efgh'}; 'hello!'"; DOESN'T work in Smarty 3.1.2
    var code = "'hello!'";
    return code;
}

GLOBAL.strayFunc = function (v1, v2) {
    return v1+','+v2;
};

GLOBAL.strayNoArgs = function () {
    return 'bar';
};

GLOBAL.TestClassObj = function() {
    this.prop = 'TestClassObj.prop';
    this.obData = {
        'ob1' : 'test1',
        'ob2' : { 'value' : 'test2' }
    };
}

GLOBAL.TestClassObj.prototype.func = function() {
    return 'TestClassObj.func';
}

GLOBAL.insert_testInsert = function (params, data) {
    var s = '';
    for (nm in params) {
        s += '[' + nm +': ' + params[nm] +'] ';
    }
    data['insertResult'] = s;
    return s;
}

GLOBAL.smarty_insert_testInsertWithScript = function (params, data) {
    var s = '';
    for (nm in params) {
        s += '[' + nm +': ' + params[nm] +'] ';
    }
    data['insertWithScriptResult'] = s;
    return s;
}

module.exports = {
    getTemplateData: getTemplateData,
    getData: getData,
    test: test
};
