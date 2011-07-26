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
	
	Array.prototype.notInForeach = "{foreach} loops only on numerical indexes in Array";
	
	var data = {
		'foo' : 'bar',
		'a' : ['0','1','2','3','4','5','6','7','8','9'],
		'o' : { '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9' },
		'ob' : {
			'prop1': 'prop1', 
			'prop2': { 'txt':'txt', 'num':777, 'bool_true': 1 }
		},
		'code' : '[$ob.prop2.txt]',
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
	
	jSmart.prototype.getTemplate = function(name) {
		var tplTxt = document.getElementById(name.replace('.','_')).innerHTML;
		if (isIE)
		{
			tplTxt = tplTxt.replace(/\r\n/g,'\n').replace(/^\n*/,'');
		}
		return tplTxt;
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
	
	i = 0;
    jSmart.prototype.registerPlugin(
        'block', 
        'testRepeat', 
        function(params, content, data, repeat)
        {
			if (!content && 'hide' in params && params['hide'] == true)
			{
				repeat.value = false;
			}
			if (content)
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
	
	
	function strayFunc(v1, v2)
	{
		return v1 + ',' + v2;
	}
	
</script>
{/literal}


<h1 id="qunit-header">jSmart unit test</h1>
<h2 id="qunit-banner"></h2>
<div id="qunit-testrunner-toolbar"></div>
<h2 id="qunit-userAgent"></h2>
<ol id="qunit-tests"></ol>


{function name='includeTest'}
<script type="text/x-jsmart-tmpl" id='{$nm}_php'>{include file="{$nm}.tpl"}</script>
<script type="text/x-jsmart-tmpl" id='{$nm}_tpl'>{include_literal file=$nm}</script>
{/function}


{function name='runTest'}

	{includeTest nm=$nm}
	
	<script>
		try 
		{
			var tpl = new jSmart($('#{$nm}_tpl').html());
			var res_{$nm} = tpl.fetch(data);
			var res2_{$nm} = $('#{$nm}_tpl').html().fetch(data);

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
			equal(resJS, resPHP);
			equal(res2_{$nm}, res_{$nm});
		} );
	</script>

	
{/function}

{runTest nm='comments'}
{runTest nm='var'}
{runTest nm='append'}
{runTest nm='assign'}
{*runTest nm='call'*}
{*runTest nm='javascript'*}
{runTest nm='capture'}
{runTest nm='eval'}
{runTest nm='for'}
{runTest nm='foreach'}
{runTest nm='function'}
{runTest nm='if'}
{runTest nm='rldelim'}
{runTest nm='literal'}
{runTest nm='section'}
{runTest nm='strip'}
{runTest nm='while'}
{runTest nm='include'}
<script type="text/x-jsmart-tmpl" id='parent_tpl'>{include_literal file='parent'}</script>
<script type="text/x-jsmart-tmpl" id='child1_tpl'>{include_literal file='child1'}</script>
{runTest nm='child2'}  {*extends*}
{runTest nm='plugins'}
{runTest nm='cycle'}
{runTest nm='counter'}

{runTest nm='modifiers'}

{runTest nm='examples'}

</body>
</html>