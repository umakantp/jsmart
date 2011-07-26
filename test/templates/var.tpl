{$foo}

{'abcdef'}

{$zzz = "text value"}
{$zzz}

{$zzz = 'new text value'}
{$zzz}

{'abcdef'}

{$ob['prop3'] = 'prop value'}
{$ob.prop3}

{$aaa = '$bbb'}

{$aaa}

{$test_with_code = $foo}
{$test_with_code}

{$test_with_code = '$foo'}
{$test_with_code}

{$test_with_code = '{$foo}'}
{$test_with_code}

{$test_with_code = "{$foo}"}
{$test_with_code}

{$test_with_code = "{$foo} + '123'"}
{$test_with_code}

{$test_with_code = '{for $z=1 to 5}[{$z}]{/for}'}
{$test_with_code}

{$test_with_code = "{for $z=1 to 5}[{$z}]{/for}"}
{$test_with_code}

{strayFunc('abc','def')}-

{strayFunc($ob.prop2.txt,$foo)}-

{strayFunc($ob.prop2['txt'],$foo)} -