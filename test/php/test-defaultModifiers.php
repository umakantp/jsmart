<?php
/*
 * Executes test cases default modifiers.
 */

include (__DIR__)."/test-common.php";

$smarty->default_modifiers = array("replace:'text_to_replace':'replaced'", 'escape:"htmlall"');	//<-no template variables allowed here (e.g. 'replace:'a':$b' - error)
$smarty->assign('replace_me','<b>text_to_replace</b>');
$smarty->display(('default_modifiers.tpl'));
