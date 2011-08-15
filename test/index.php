<?php

date_default_timezone_set('Universal');		//to silence the PHP warning

define('SMARTY_DIR','./smarty/');
require_once SMARTY_DIR . 'Smarty.class.php';

$smarty = new Smarty;
$smarty->compile_check = true;
$smarty->debugging = false;
$smarty->allow_php_tag = true;

function include_literal($params, $smarty)
{
	return file_get_contents('./templates/'.$params['file'].'.tpl');
}

$smarty->registerPlugin('function', 'include_literal', 'include_literal');

$smarty->assign('foo','bar');
$smarty->assign('a',array('0','1','2','3','4','5','6','7','8','9'));
$smarty->assign('a2',array('0',array('baz'=>'baz')));
$smarty->assign('o',array('0'=>'0','1'=>'1','2'=>'2','3'=>'3','4'=>'4','5'=>'5','6'=>'6','7'=>'7','8'=>'8','9'=>'9'));
$smarty->assign('ob', array('prop1'=>'prop1', 'prop2'=> array('txt'=>'txt', 'num'=>777, 'bool_true'=>true)));
$smarty->assign('code','[$ob.prop2.txt]');
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
	}
	return '['.$content.']';
}
$smarty->registerPlugin('block', 'testRepeat', 'testRepeat');


$smarty->display('main.tpl');

?>