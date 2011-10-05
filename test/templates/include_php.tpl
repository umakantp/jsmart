{include_php "$testPath/test.php"}
{include_php "$testPath/test.php"}

{*$testVar.a*}

{include_php "$testPath/test.php"}
{include_php "$testPath/test.php" once=false}
{include_php "$testPath/test.php"  once=false assign='abcdef'} {$abcdef}