# avcajaraville/jsmart

## Notice

This is a fork from [umakantp/jsmart](https://github.com/umakantp/jsmart), which is also a fork from [miroshnikov/jsmart](https://github.com/miroshnikov/jsmart).

I originally forked from [umakantp/jsmart](https://github.com/umakantp/jsmart) and added the following modifications:

- Force **nocache** option for **extends** blocks. This was causing templates being only properly compiled once. If you need cache (and you probably would), you will have to address this outside the jSmart class.
- Add UMD, CommonJS & web/browser support. Based on [this pull request](https://github.com/umakantp/jsmart/pull/14).
- Remove **String.prototype.fetch** function (since this is a very bad practice), and instead, modifying the export of the module. Now it exports the constructor and the fetch function.
- The module now exports the following object: `{ jSmart: jSmart, fetch: fetch }`. This is, `jSmart` constructor and `fecth` function


**Caution**: when using fetch function, you want to proper set it context (ie: call or apply to the rescue). I didn’t want to re-write this function and keep as it was originally written.

## How to use it

Im gonna just highlight the main differences with [umakantp/jsmart](https://github.com/umakantp/jsmart).

For a more detailed explanation and documentation, please refer to [it main repository](https://github.com/umakantp/jsmart) or the [wiki](https://github.com/umakantp/jsmart/wiki)

```javascript

var import_jSmart = require( 'jsmart' );
// import the constructor:
var jSmart = import_jSmart.jSmart;
// and the fetch function:
var fetch = import_jSmart.fetch;

// Following the example on the original repo (refer to it for more details):
var fs = require( 'fs' );
var tpl = fs.readFileSync( './demo.tpl', { encoding: 'utf-8' } );
var compiledTpl = new jSmart( tpl );
// We need to set the context of the fetch function, for example, through Function.prototype.call function
var output = fetch.call( compiledTpl, { name: 'World' } );
console.log( output );

```

## Thanks to

- [miroshnikov](https://github.com/miroshnikov) for his [original jSmart](https://github.com/miroshnikov/jsmart).
- [umakantp](https://github.com/umakantp) for his [jSmart fork](https://github.com/umakantp/jsmart).
- [duzun](https://github.com/duzun) for adding UMD support on his [pull request](https://github.com/umakantp/jsmart/pull/14).