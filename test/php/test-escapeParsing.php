<?php
/*
 * Executes test cases for filters.
 */

include (__DIR__)."/test-common.php";

$smarty->left_delimiter = '<!--{';
$smarty->right_delimiter = '}-->';
$smarty->auto_literal = false;

$smarty->assign('foo', 'bar');
$smarty->assign('a', array('0','1','2','3','4','5','6','7','8','9'));

$smarty->display('escape_parsing.tpl');
