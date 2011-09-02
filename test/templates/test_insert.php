<?php
function smarty_insert_testInsertWithScript($params, $smarty)
{
	$s = '';
	foreach ($params as $nm => $v)
	{
		$s .= "[$nm: $v] ";
	}
	$smarty->assign('insertWithScriptResult',$s);
	return $s;
}
?>