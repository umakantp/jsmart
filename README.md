jSmart - Smarty template engine in JavaScript
======
[![Build Status](https://travis-ci.org/umakantp/jsmart.png?branch=master)](https://travis-ci.org/umakantp/jsmart)
[![npm version](https://img.shields.io/npm/v/jsmart.svg)](https://www.npmjs.com/package/jsmart)
[![David](https://img.shields.io/david/dev/umakantp/jsmart.svg)](https://www.npmjs.com/package/jsmart)
[![npm](https://img.shields.io/npm/dw/jsmart.svg)](https://www.npmjs.com/package/jsmart)
[![npm](https://img.shields.io/npm/l/jsmart.svg)](https://github.com/umakantp/jsmart/blob/master/LICENSE)

jSmart is a port of the Smarty Template Engine to Javascript, a JavaScript template library that supports the template [syntax](https://github.com/umakantp/jsmart/wiki/syntax) and all the features (functions, variable modifiers, etc.) of the well-known PHP template engine [Smarty](http://www.smarty.net/).

jSmart is written entirely in JavaScript, does not have any DOM/browser or third-party JavaScript library dependencies and can be run in a web browser as well as a standalone JavaScript interpreter or [CommonJS](http://www.commonjs.org/) environments like [node.js](https://nodejs.org/).

jSmart supports plugin architecture, you can [extend it with custom plugins](https://github.com/umakantp/jsmart/wiki/Create-Plugin): functions, blocks and variable modifiers, [templates inclusion](https://github.com/umakantp/jsmart/wiki/Include-Templates), [templates inheritance](https://github.com/umakantp/jsmart/wiki/Template-Inheritance) and overriding, [caching](https://github.com/umakantp/jsmart/wiki/Caching), [escape HTML](https://github.com/umakantp/jsmart/wiki/escape_html).

jSmart has some limited support of the [PHP Smarty syntax](https://github.com/umakantp/jsmart/wiki/syntax) and allows you to [use the same Smarty templates on both server and client side](https://github.com/umakantp/jsmart/wiki/Smarty-template-in-javascript), for both PHP and Javascript.

Play with JsFiddle [demo page](https://jsfiddle.net/8p8xua0k/1/)

### Using jSmart with CDN
##### Always latest version (don't use in production)
```
https://cdn.jsdelivr.net/npm/jsmart/dist/jsmart.min.js
```
##### Current latest version (4.0.0)
```
https://cdn.jsdelivr.net/npm/jsmart@3.1.0/dist/jsmart.min.js
```
### jSmart with other tools

1. Webpack:- [https://www.npmjs.com/package/jsmart-loader](https://www.npmjs.com/package/jsmart-loader)
2. Grunt:- [https://www.npmjs.com/package/grunt-jsmart](https://www.npmjs.com/package/grunt-jsmart)
3. Express Js :- [https://www.npmjs.com/package/jsmart-express](https://www.npmjs.com/package/jsmart-express)

### How to use jSmart in Node.js

1. Install jSmart from NPM Registry
```
$ npm install jsmart --save
```

2. Create template, use [PHP Smarty syntax](https://github.com/umakantp/jsmart/wiki/syntax).  Say demo.tpl

```smarty
Hello {$name}
```

3. Now lets read the template and compile it. _jSmart_ object compiles the template. You can call _fetch_ function as many times with different data you would want to assign to template.
```js
var fs = require('fs'),
  jSmart = require('jsmart'),
  tpl = fs.readFileSync('./demo.tpl', {encoding: 'utf-8'}),
  compiledTemplate = new jSmart(tpl),
  output = compiledTemplate.fetch({name: 'World'});
  // output will be "Hello world"

console.log(output);
```

4. Execute the file.

```cli
$ node demo.js
```

### How to use jSmart in browser

1. Include jSmart library Javascript file in your header.

```html
<html>
  <head>
    <script language="javascript" src="jsmart.js"></script>
  </head>
```

2. Create template, use [PHP Smarty syntax](https://github.com/umakantp/jsmart/wiki/syntax). Put the template's text in _&lt;script&gt;_ with the _type="text/x-jsmart-tmpl"_ so a browser will not try to parse it and mess it up.
```js
  <script id="test_tpl" type="text/x-jsmart-tmpl">
    Hello {$name}
  </script>
```

3. Create new object of _jSmart_ class, passing the template's text as it's constructor's argument than call _fetch(data)_, where data is an JavaScript object with variables to assign to the template
```js
<script>
  var content = document.getElementById('test_tpl').innerHTML;
  var compiled = new jSmart(content);
  var output = compiled.fetch({name: 'world'});
  // output will be "Hello world"
</script>
```

### How to use jSmart using Require.js

1. If you have configured and installed Require.js it easy to load jSmart and use it. Load jSmart.js file in the browser/environment and it already makes use require js to define module, you got to just include it.
```js
define(['jSmart'], function (jSmart) {
  var tplText = 'Hello {$name}';
  var compiled = new jSmart(tplText);
  var output = compiled.fetch({name: 'world'});
  // output is "Hello world"
});
```

2. You can also make use Require.js text plugin to load templates.
```js
define(['jSmart', 'text!some/good/template.tpl'], function (jSmart, goodTpl) {
  var compiled = new jSmart(goodTpl);
  var output = compiled.fetch({name: 'world'});
  // output is "Hello world"
});
```

### DOCUMENTATION

[https://github.com/umakantp/jsmart/wiki](https://github.com/umakantp/jsmart/wiki)

### CONTRIBUTIONS & TESTS

* Pull request
  Best is open a issue first. Then send a pull request referencing the issue number. Before sending pull request make sure you add test case for the fix. Make sure all test cases are passing and eslint tests pass.

* Test cases:-
  ```grunt karma```

* ES Lint tests:-
  ```grunt eslint```

* Run lint, run test, build, compress, distribution package and update examples in one command:-
  ```grunt```

### LICENSE

[MIT](https://raw.githubusercontent.com/umakantp/jsmart/master/LICENSE)

### NOTICE

Project originally was created by [miroshnikov](https://github.com/miroshnikov). Since author was not active on project very frequently. I have forked and planned on pushing further improvements and features on my own fork.
