<?php

date_default_timezone_set('Universal');		//to silence the PHP warning

define('SMARTY_DIR','./smarty/');
require_once SMARTY_DIR . 'Smarty.class.php';

$smarty = new Smarty;
$smarty->compile_check = true;
$smarty->debugging = false;


function include_literal($params, $smarty)
{
	return file_get_contents('./templates/'.$params['file'].'.tpl');
}

$smarty->registerPlugin('function', 'include_literal', 'include_literal');

$smarty->assign('foo','bar');
$smarty->assign('a',array('0','1','2','3','4','5','6','7','8','9'));
$smarty->assign('aEmpty',array());
$smarty->assign('o',array('0'=>'0','1'=>'1','2'=>'2','3'=>'3','4'=>'4','5'=>'5','6'=>'6','7'=>'7','8'=>'8','9'=>'9'));
$smarty->assign('ob', array('prop1'=>'prop1', 'prop2'=> array('txt'=>'txt', 'num'=>777, 'bool_true'=>true)));
$smarty->assign('code','[$ob.prop2.txt]');


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


$smarty->display('main.tpl');

?>