<?php
/*
 * Executes test cases for filters.
 */

include (__DIR__)."/test-common.php";

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


function filterTest() {
	return "FILTER_TEST";
}

$smarty->registerFilter('pre','preFilterTest');
$smarty->registerFilter('pre','preFilterTest2');
$smarty->registerFilter('variable','varFilterTest');
$smarty->registerFilter('output','outputFilterTest');
$smarty->assign('foo','FILTER_TEST');
$smarty->assign('t','test');
$smarty->display('filtered.tpl');

