<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

	<title>jSmart unit test</title>
	
	<script type="text/javascript" src="../smart{if $use_compiled}.min{/if}.js"></script>
	<script type="text/javascript" src="jquery.min.js"></script>
	<script type="text/javascript" src="qunit.js"></script>
	
	<link rel="stylesheet" href="qunit.css" type="text/css" media="screen" />
</head>

<body>

{literal}
<script>

	var isIE = navigator.userAgent.indexOf("MSIE") >= 0;
	var isOpera = navigator.userAgent.indexOf("Opera") >= 0;
	
	Array.prototype.notInForeach = "{foreach} loops only through own properties of Object";
	
	
	TestClassObj = function()
	{
		this.prop = 'TestClassObj.prop';
		this.obData = {
			'ob1' : 'test1',
			'ob2' : { 'value' : 'test2' }
		};
	}
	
	TestClassObj.prototype.func = function()
	{
		return 'TestClassObj.func';
	}

	
	jSmart.prototype.getTemplate = function(name) {
		var tplTxt = document.getElementById(name.replace('.','_')).innerHTML;
		if (isIE)
		{
			return tplTxt.replace(/\r\n/g,'\n').replace(/^\n*/,'');
		}
		return tplTxt;
	}
	
	jSmart.prototype.getFile = function(name) {
		var fileContent = document.getElementById(name.replace(/^\//,'').replace('.','_')).innerHTML;
		if (isIE)
		{
			return fileContent.replace(/\r\n/g,'\n').replace(/^\n*/,'');
		}
		return fileContent;
	}
	
	jSmart.prototype.getJavascript = function(name) {
		if (name == '/test_insert.php')
		{
			return document.getElementById('test_insert').innerHTML;
		}
		//var code = "$this.$testVar = {'a':'abcd','b':'efgh'}; 'hello!'"; DOESN'T work in Smarty 3.1.2
		var code = "'hello!'";
		return code;
	}
	
	jSmart.prototype.getConfig = function(name) {
		return document.getElementById(name.replace(/^\//,'')).innerHTML;
	}
	
    jSmart.prototype.registerPlugin(
        'function', 
        'sayHello', 
        function(params, data)
        {
			var s = 'Hello ';
			if ('to' in params)
			{
				s += params['to'];
			}
			return s;
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
	
    jSmart.prototype.registerPlugin(
        'function', 
        'isEmptyStr', 
        function(params, data)
        {
			return params['s'].length == 0;
		}
	);

	
	i = 0;
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
	
	function insert_testInsert(params, data)
	{
		var s = '';
		for (nm in params)
		{
			s += '[' + nm +': ' + params[nm] +'] ';
		}
		data['insertResult'] = s;
		return s;
	}
	
	function strayFunc(v1, v2)
	{
		return v1 + ',' + v2;
	}
	
	function strayNoArgs()
	{
		return 'bar';
	}
	
</script>

<script type="text/x-jsmart-tmpl" id='test_insert'>
	function smarty_insert_testInsertWithScript(params, data)
	{
		var s = '';
		for (nm in params)
		{
			s += '[' + nm +': ' + params[nm] +'] ';
		}
		data['insertWithScriptResult'] = s;
		return s;
	}
</script>	


<script>
	escapeParse = '';
	filtered = '';
	escapeHtml = '';
	defaultModifier = '';
	includePHP = '';
	phpTag = '';
	
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
			'testClassObj': new TestClassObj,
			'includePHP': includePHP,
			'php': phpTag,
			'escapeParse': escapeParse,
			'filtered': filtered,
			'escapeHtml': escapeHtml,
			'defaultModifier': defaultModifier
		};
	}
</script>
{/literal}


<h1 id="qunit-header">jSmart unit test</h1>
<h2 id="qunit-banner"></h2>
<div id="qunit-testrunner-toolbar"></div>
<h2 id="qunit-userAgent"></h2>
<ol id="qunit-tests"></ol>

{$testPath = "{$smarty.server.DOCUMENT_ROOT}/test/templates"}

{function name='includeTest'}
<script type="text/x-jsmart-tmpl" id='{$nm}_php'>{include file="{$nm}.tpl"}</script>
<script type="text/x-jsmart-tmpl" id='{$nm}_tpl'>{fetch file="$testPath/$nm.tpl"}</script>
{/function}


{function name='runTest'}

	{includeTest nm=$nm}
	
	<script>
		try 
		{
			var tpl1 = new jSmart($('#{$nm}_tpl').html());
			var cache = tpl1.tree;
			
			var tpl = new jSmart;
			tpl.tree = cache;
			var res_{$nm} = tpl.fetch(getData());
		} catch(e) 
		{
			alert(e.name + ' ' + e.message);
			throw e;
		}
		test("{$nm}", function() {
			var resJS = res_{$nm};
			var resPHP = $('#{$nm}_php').html();
			if (isIE)
			{
				//IE bug: it adds an extra new line at the beginning and strip existing new lines from the end of SCRIPT innerHTML
				resJS = resJS.replace(/^\n*/,'').replace(/\n*$/,'');
				resPHP = resPHP.replace(/\r\n/g,'\n').replace(/^\n*/,'').replace(/\n*$/,'');
			}
			if (isOpera)
			{
				resPHP = resPHP.replace(/\r\n/g,'\n');
			}
			equal(resJS, resPHP);
		} );
	</script>

	
{/function}

<script type="text/x-jsmart-tmpl" id='included_tpl'>{fetch file="$testPath/included.tpl"}</script>
<script type="text/x-jsmart-tmpl" id='included2_tpl'>{fetch file="$testPath/included2.tpl"}</script>
<script type="text/x-jsmart-tmpl" id='test.conf'>{fetch file="$testPath/test.conf"}</script>

<script type="text/x-jsmart-tmpl" id='escape_parsing_tpl'>{fetch file="$testPath/escape_parsing.tpl"}</script>
{literal}
<script>
	jSmart.prototype.left_delimiter = '<!--{';
	jSmart.prototype.right_delimiter = '}-->';
	jSmart.prototype.auto_literal = false;

	var t = new jSmart($('#escape_parsing_tpl').html().replace(/\r\n/g,'\n').replace(/^\n*/,''));
	escapeParse = t.fetch( {
		foo: 'bar',
		a: ['0','1','2','3','4','5','6','7','8','9']
	} );
	
	jSmart.prototype.left_delimiter = '{';
	jSmart.prototype.right_delimiter = '}';
	jSmart.prototype.auto_literal = true;
</script>
{/literal}

{runTest nm='comments'}
{runTest nm='var'}
{runTest nm='append'}
{runTest nm='assign'}
{runTest nm='call'}
{runTest nm='capture'}
{runTest nm='config_load'}
{runTest nm='eval'}
{runTest nm='fetch'}
{runTest nm='for'}
{runTest nm='foreach'}
{runTest nm='function'}
{runTest nm='if'}
{runTest nm='insert'}
{runTest nm='rldelim'}
{runTest nm='literal'}
{runTest nm='section'}
{runTest nm='strip'}
{runTest nm='while'}
{runTest nm='include'}
<script type="text/x-jsmart-tmpl" id='parent_tpl'>{fetch file="$testPath/parent.tpl"}</script>
<script type="text/x-jsmart-tmpl" id='child1_tpl'>{fetch file="$testPath/child1.tpl"}</script>
{runTest nm='child2'}  {*extends*}
{runTest nm='plugins'}
{runTest nm='cycle'}
{runTest nm='counter'}
{runTest nm='html_checkboxes'}
{runTest nm='html_image'}
{runTest nm='html_options'}
{runTest nm='html_radios'}
{runTest nm='html_table'}
{runTest nm='textformat'}
{runTest nm='modifiers'}
{runTest nm='examples'}
{runTest nm='setfilter'}

<script>
	try 
	{
		var tpl = new jSmart($('#function_tpl').html());
		var res_JS_string = tpl.fetch(getData());
		var res2_JS_string = $('#function_tpl').html().fetch(getData());
	} catch(e) 
	{
		alert(e.name + ' ' + e.message);
	}
	test("from JS string", function() {
		equal(res_JS_string, res2_JS_string);
	} );
</script>


<script type="text/x-jsmart-tmpl" id='javascript_tpl'>{fetch file="$testPath/javascript.tpl"}</script>
<script type="text/x-jsmart-tmpl" id='javascript_result'>{fetch file="$testPath/javascript_result.txt"}</script>
<script>
	try 
	{
		var tpl = new jSmart($('#javascript_tpl').html().replace(/\r\n/g,'\n'));
		var res_JS_only = tpl.fetch(getData());
		var res2_JS_only = $('#javascript_result').html().replace(/\r\n/g,'\n');
	} catch(e) 
	{
		alert(e.name + ' ' + e.message);
	}
	test("javascript ONLY", function() {
		equal(res_JS_only, res2_JS_only);
	} );
</script>

<script>
	try 
	{
		var tpl = new jSmart;
		var emptyString = tpl.fetch();
	} catch(e) 
	{
		alert(e.name + ' ' + e.message);
	}
	test("empty template and data", function() {
		equal(emptyString, '');
	} );
</script>


<script type="text/x-jsmart-tmpl" id='include_php_tpl'>{fetch file="$testPath/include_php.tpl"}</script>
<script type="text/x-jsmart-tmpl" id='php_tpl'>{fetch file="$testPath/php.tpl"}</script>
{literal}
<script>
	try 
	{
		var t = new jSmart($('#include_php_tpl').html().replace(/\r\n/g,'\n').replace(/^\n*/,''));
		includePHP = t.fetch( {replace_me: '<b>text_to_replace</b>' } );
		
		t = new jSmart($('#php_tpl').html().replace(/\r\n/g,'\n').replace(/^\n*/,''));
		phpTag = t.fetch( {} );
	} catch(e) 
	{
		alert(e.name + ' ' + e.message);
	}
</script>
{/literal}

{runTest nm='deprecated'}



<!-- <script type="text/javascript" src="php.default.min.js"></script> -->
<script type="text/javascript" src="defplusstrftime.namespaced.min.js"></script>
{runTest nm='mailto'}
{runTest nm='math'}

<script type="text/x-jsmart-tmpl" id='escape_html_tpl'>{fetch file="$testPath/escape_html.tpl"}</script>
{literal}
<script>
	jSmart.prototype.escape_html = true;
	var t = new jSmart($('#escape_html_tpl').html().replace(/\r\n/g,'\n').replace(/^\n*/,''));
	escapeHtml = t.fetch( { textWithHTML: '<span style="color:red;"><i><b>foo</b></i></span>' } );
	jSmart.prototype.escape_html = false;
</script>
{/literal}

{runTest nm='phpjs'}



<script type="text/x-jsmart-tmpl" id='filtered_tpl'>{fetch file="$testPath/filtered.tpl"}</script>
<script type="text/x-jsmart-tmpl" id='default_modifiers_tpl'>{fetch file="$testPath/default_modifiers.tpl"}</script>
{literal}
<script>
	function filterTest()
	{
		return "FILTER_TEST";
	}
	jSmart.prototype.registerFilter('pre',function(s) {return s.replace(/<!--.*-->/g,'changed in PRE filter');});
	jSmart.prototype.registerFilter('pre',function(s) {return s.replace(/changed/g,'----------');});
	jSmart.prototype.registerFilter('variable',function(s) {return (new String(s)).replace(/FILTER_TEST/g,'changed in VAR filter');});
	jSmart.prototype.registerFilter('post',function(s) {return s.replace(/FILTER_TEST/g,'changed in POST filter');});
	var t = new jSmart($('#filtered_tpl').html().replace(/\r\n/g,'\n').replace(/^\n*/,''));
	filtered = t.fetch( {foo: 'FILTER_TEST', 't':'test'} );
	
</script>

<script>
	jSmart.prototype.addDefaultModifier( ["replace:'text_to_replace':'replaced'", 'escape:"htmlall"'] );
	var t = new jSmart($('#default_modifiers_tpl').html().replace(/\r\n/g,'\n').replace(/^\n*/,''));
	defaultModifier = t.fetch( {replace_me: '<b>text_to_replace</b>' } );
</script>
{/literal}

{runTest nm='filters'}


</body>
</html>