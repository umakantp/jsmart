<?php
/*
 * Executes test cases default modifiers.
 */

include (__DIR__)."/test-common.php";

$filename = $argv[1];

$smarty->display($filename.'.tpl');
