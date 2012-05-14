require('../smart.min.js');

var fs = require('fs');

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
		'nullVar': null
	};
}

function test(fnm) {
	fs.readFile('./templates/'+fnm+'.tpl', 'utf8', function(err,data){
		var t = new jSmart(data);
		var res = t.fetch(getData());
		console.log(res);
	});	
	//fs.openSync('./templates/comments.tpl','r');
}

var files = []; //['cycle'];

for (var i=0; i<files.length; ++i) {
	test(files[i]);
}




var phpjs = require('./php.full.commonjs.min.js');
global['rawurlencode'] = phpjs['rawurlencode'];

console.log(  "{mailto address='bill.gates@microsoft.com' cc='steve.jobs@apple.com'}".fetch()  );


/* OR
var php = require('./php.full.commonjs.min.js');
console.log(  php.rawurlencode('test')  );
*/

/* ERROR:  WINDOW IS NOT DEFINED
require('./php.full.namespaced.min.js');
$P = new PHP_JS();
console.log(  rawurlencode('test')  );
*/