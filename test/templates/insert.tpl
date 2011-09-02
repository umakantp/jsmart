{insert name='testInsert' a=$foo abcd='abcd'}
[{$insertResult}]

{insert 'testInsert' a=$foo|upper b="$foo" assign='zzzzz'}-
[{$zzzzz}]

{insert 'testInsertWithScript' c=$foo|upper d="$foo" script="$testPath/test_insert.php"}
[{$insertWithScriptResult}]
