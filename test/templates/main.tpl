<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<head>
	<title>jSmart unit test</title>
	
	<script type="text/javascript" src="../smart{if $use_compiled}.min{/if}.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
	<script type="text/javascript" src="http://github.com/jquery/qunit/raw/master/qunit/qunit.js"></script>
	
	<link rel="stylesheet" href="http://github.com/jquery/qunit/raw/master/qunit/qunit.css" type="text/css" media="screen" />
	{literal}
	<style type="text/css">
		textarea.test { display:none; }
	</style>
	{/literal}
</head>

<body>

{literal}
<script>
	var data = {
		'smarty' : {},
		'a' : ['0','1','2','3','4','5','6','7','8','9'],
		'aEmpty' : [],
		'o' : { '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9' },
		'ob' : {
			'prop1': 'prop1', 
			'prop2': { 'txt':'txt', 'num':777, 'bool_true': 1 }
		},
		'code' : '[$ob.prop2.txt]',
		
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
		]
	};
</script>
{/literal}


<h1 id="qunit-header">jSmart unit test</h1>
<h2 id="qunit-banner"></h2>
<div id="qunit-testrunner-toolbar"></div>
<h2 id="qunit-userAgent"></h2>
<ol id="qunit-tests"></ol>


{function name='includeTest'}
<textarea class='test' id='{$nm}_php'>{include file="{$nm}.tpl"}</textarea>
<textarea class='test' id='{$nm}_js'>{include_literal file=$nm}</textarea>
{/function}


{function name='runTest'}

	{includeTest nm=$nm}
	
	<script>
		try 
		{
			var tpl = new jSmart($('#{$nm}_js').val());
			var res_{$nm} = tpl.fetch(data);
			var res2_{$nm} = $('#{$nm}_js').val().fetch(data);

		} catch(e) 
		{
			alert(e.name + ' ' + e.message);
		}
		test("{$nm}", function() {
			equal(res_{$nm}, $('#{$nm}_php').val());
			equal(res2_{$nm}, res_{$nm});
		} );
	</script>

	
{/function}


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

{runTest nm='cycle'}
{runTest nm='counter'}



{* test block *}

<textarea class='test' id='block_php'>{include file="child2.tpl"}</textarea>
<textarea class='test' id='parent_js'>{include_literal file='parent'}</textarea>
<textarea class='test' id='child1_js'>{include_literal file='child1'}</textarea>
<textarea class='test' id='child2_js'>{include_literal file='child2'}</textarea>

{literal}
<script>
	var tpl = new jSmart($('#parent_js').val(), $('#child1_js').val(), $('#child2_js').val());
	var res_block = tpl.fetch();
	test("block", function() {
		equal(res_block, $('#block_php').val())
	} );
</script>
{/literal}

{runTest nm='examples'}

</body>
</html>