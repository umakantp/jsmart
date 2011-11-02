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
	escapeHtml = '';
	
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
			'escapeParse': escapeParse,
			'escapeHtml': escapeHtml
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
			var tpl = new jSmart($('#{$nm}_tpl').html());
			var res_{$nm} = tpl.fetch(getData());
		} catch(e) 
		{
			alert(e.name + ' ' + e.message);
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
{*runTest nm='javascript'*}
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
{runTest nm='include_php'}
{runTest nm='php'}
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


<script>
	test("from JS string", function() {
		var tpl = new jSmart($('#function_tpl').html());
		var res_JS_string = tpl.fetch(getData());
		var res2_JS_string = $('#function_tpl').html().fetch(getData());
		equal(res_JS_string, res2_JS_string);
	} );
</script>

<script type="text/x-jsmart-tmpl" id='javascript_tpl'>{fetch file="$testPath/javascript.tpl"}</script>
<script type="text/x-jsmart-tmpl" id='javascript_result'>{fetch file="$testPath/javascript_result.txt"}</script>
<script>
	test("javascript ONLY", function() {
		var tpl = new jSmart($('#javascript_tpl').html().replace(/\r\n/g,'\n'));
		var res_JS_only = tpl.fetch(getData());
		var res2_JS_only = $('#javascript_result').html().replace(/\r\n/g,'\n');
		equal(res_JS_only, res2_JS_only);
	} );
</script>


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

</body>
</html>