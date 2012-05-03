require('../smart.min.js');

var t = new jSmart('[{$test}]');

console.log(t.fetch({'test':'hello world'}));


var fs = require('fs');
fs.readFile('./templates/comments.tpl', 'utf8', function(err,data){
	console.log(data);
});

//fs.openSync('./templates/comments.tpl','r');