<?php

ini_set('display_errors', 1);

//To test date_format modifier.
date_default_timezone_set('Asia/Calcutta');

require_once dirname(dirname(dirname(__DIR__))) . '/smarty/libs/Smarty.class.php';

$fileName = $argv[1];

$smarty = new Smarty();
$smarty->setTemplateDir(__DIR__.'/../templates')->setCompileDir(__DIR__.'/../templates_c');
$smarty->debugging = false;

$smarty->assign('foo', 'bar');
$smarty->assign('a', array('0','1','2','3','4','5','6','7','8','9'));
$smarty->assign('a2',array('0',array('baz'=>'baz')));
$smarty->assign('o',array('0'=>'0','1'=>'1','2'=>'2','3'=>'3','4'=>'4','5'=>'5','6'=>'6','7'=>'7','8'=>'8','9'=>'9'));
$smarty->assign('ob', array('prop1'=>'prop1', 'prop2'=> array('txt'=>'txt', 'num'=>777, 'bool_true'=>true)));
$smarty->assign('code','[{$ob.prop2.txt}]');
$smarty->assign('num',7);
$smarty->assign('long_text', "\nfirst paragraph. Second sentence. \nNext paragraph. AAAAA.    Third sentence \n\n\n Third paragraph\n");
$smarty->assign('aEmpty',array());
$smarty->assign('sEmpty','');
$smarty->assign('nullVar',null);
$smarty->assign('textWithHTML','<span style="color:red;"><i><b>foo</b></i></span>');
$smarty->assign('testPath', dirname(__DIR__).'/templates');

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


function strayFunc($v1, $v2)
{
	return $v1.','.$v2;
}

function strayNoArgs()
{
	return 'bar';
}

$smarty->registerPlugin('function', 'strayNoArgs', 'strayNoArgs');
$smarty->registerPlugin('function', 'strayFunc', 'strayFunc');

class TestClassObj
{
	public $prop = 'TestClassObj.prop';
	public $obData = array(
		'ob1' => 'test1',
		'ob2' => array( 'value' => 'test2' )
	);
	public function func()
	{
		return 'TestClassObj.func';
	}
};

$smarty->assign('testClassObj', new TestClassObj);
