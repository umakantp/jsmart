<?php

date_default_timezone_set('Europe/Moscow');		//to test date_format modifier

define('SMARTY_DIR','./smarty/');
require_once SMARTY_DIR . 'SmartyBC.class.php';

$smarty = new SmartyBC;
$smarty->compile_check = true;
$smarty->debugging = false;
//$smarty->allow_php_tag = true;


$smarty->assign('foo','bar');
$smarty->assign('a',array('0','1','2','3','4','5','6','7','8','9'));
$smarty->assign('a2',array('0',array('baz'=>'baz')));
$smarty->assign('o',array('0'=>'0','1'=>'1','2'=>'2','3'=>'3','4'=>'4','5'=>'5','6'=>'6','7'=>'7','8'=>'8','9'=>'9'));
$smarty->assign('ob', array('prop1'=>'prop1', 'prop2'=> array('txt'=>'txt', 'num'=>777, 'bool_true'=>true)));
$smarty->assign('code','[{$ob.prop2.txt}]');
$smarty->assign('num',7);
$smarty->assign('long_text', "\nfirst paragraph. Second sentence. \nNext paragraph. AAAAA.    Third sentence \n\n\n Third paragraph\n");
$smarty->assign('aEmpty',array());
$smarty->assign('sEmpty','');
$smarty->assign('nullVar',null);


function strayFunc($v1, $v2)
{
	return $v1.','.$v2;
}


$smarty->assign(
	'books',
	array(
		array(
			'title'  => 'JavaScript: The Definitive Guide',          
			'author' => 'David Flanagan',                            
			'price'  => '31.18'
		),
		array(
			'title'  => 'Murach JavaScript and DOM Scripting',
			'author' => 'Ray Harris',
			'price' => '',
		),
		array(
			'title'  => 'Head First JavaScript',
			'author' => 'Michael Morrison',
			'price'  => '29.54'
		)
	)
);

class TestClassObj
{
	public $prop = 'TestClassObj.prop';
	public function func()
	{
		return 'TestClassObj.func';
	}
};

$smarty->assign('testClassObj', new TestClassObj);

$smarty->assign('use_compiled',defined('USE_COMPILED'));


function sayHello($params, $template)
{
	$s = 'Hello ';
	if (array_key_exists('to',$params))
	{
		$s .= $params['to'];
	}
	return $s;
}
$smarty->registerPlugin('function', 'sayHello', 'sayHello');


function replaceStr($params, $content, $template, &$repeat)
{
	return str_replace($params['from'], $params['to'], $content);
}
$smarty->registerPlugin('block', 'replaceStr', 'replaceStr');


function isEmptyStr($params, $template)
{
	return strlen($params['s']) == 0;
}
$smarty->registerPlugin('function', 'isEmptyStr', 'isEmptyStr');


function testRepeat($params, $content, $template, &$repeat)
{
	if (!$content && array_key_exists('hide',$params) && $params['hide']==true) {
		$repeat = false;
		return '';
	}
	static $i = 0;
	if ($content)
	{
		if (++$i<3)
		{
			$repeat = true;
		}
		else
		{
			$i = 0;
		}
		return '['.$content.']';
	}
}
$smarty->registerPlugin('block', 'testRepeat', 'testRepeat');

function insert_testInsert($params, $smarty)
{
	$s = '';
	foreach ($params as $nm => $v)
	{
		$s .= "[$nm: $v] ";
	}
	$smarty->assign('insertResult',$s);
	return $s;
}


$smarty2 = new Smarty;
$smarty2->left_delimiter = '<!--{';
$smarty2->right_delimiter = '}-->';
$smarty2->auto_literal = false;

$smarty2->assign('foo','bar');
$smarty2->assign('a',array('0','1','2','3','4','5','6','7','8','9'));

$smarty->assign('escapeParse',$smarty2->fetch('escape_parsing.tpl'));



function preFilterTest($tpl_source, Smarty_Internal_Template $template) {
	return preg_replace("/<!--.*-->/U",'changed in PRE filter',$tpl_source);
}
function preFilterTest2($tpl_source, Smarty_Internal_Template $template) {
	return preg_replace("/changed/",'----------',$tpl_source);
}
function varFilterTest($v) {
	return preg_replace("/FILTER_TEST/",'changed in VAR filter',$v);
}
function outputFilterTest($tpl_source, Smarty_Internal_Template $template) {
	return preg_replace("/FILTER_TEST/",'changed in POST filter',$tpl_source);
}


function filterTest()
{
	return "FILTER_TEST";
}

$smarty3 = new Smarty;
$smarty3->registerFilter('pre','preFilterTest');
$smarty3->registerFilter('pre','preFilterTest2');
$smarty3->registerFilter('variable','varFilterTest');
$smarty3->registerFilter('output','outputFilterTest');
$smarty3->assign('foo','FILTER_TEST');
$smarty3->assign('t','test');
$smarty->assign('filtered',$smarty3->fetch('filtered.tpl'));


$smarty4 = new Smarty;
$smarty4->escape_html = true;
$smarty4->assign('textWithHTML','<span style="color:red;"><i><b>foo</b></i></span>');
$smarty->assign('escapeHtml',$smarty4->fetch('escape_html.tpl'));


$smarty5 = new Smarty;
$smarty5->default_modifiers = array("replace:'text_to_replace':'replaced'", 'escape:"htmlall"');	//<-no template variables allowed here (e.g. 'replace:'a':$b' - error)
$smarty5->assign('replace_me','<b>text_to_replace</b>');
$smarty->assign('defaultModifier',$smarty5->fetch('default_modifiers.tpl'));


$smarty->display('main.tpl');


?>