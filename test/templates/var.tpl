{$foo}
{$a[4]}
{$ob.prop1}
-{nocache}
	{$a2[1].baz}

	{$foo|replace:"bar":"|bar:"}

	{'abcdef'}

	{$zzz = "text value"}
	{$zzz}

	{$zzz = 'new text value'}
	{$zzz}

	{$zzz = $noVal|default:'empty'|upper}
	{$zzz}

	{'abcdef'}
{/nocache}

{$ob['prop3'] = 'prop value'}
{$ob.prop3}

{$ob.propNew = 'new prop value'}
{$ob.propNew}

{$ob.prop2.yyy = 'multidimensional (object exists)'}
{$ob.prop2.yyy}

{$ob['with space'] = 'with space'}
{$ob['with space']}

{$ob['with | symbol:'] = 'with | symbol:'}
$ob['with | symbol:']

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
{$test_with_code}{strayFunc('abc','def')}-

{strayFunc($ob.prop2.txt,$foo)}-

{$textWithTags = 'Woman Gets <font face="helvetica">New Kidney</font> from Dad she Hasn\'t Seen in <b>years</b>.'}
{$textWithTags}

{$textWithTags = "double \"quotes\" inside"}
{$textWithTags}

{strayFunc($ob.prop2['txt'],$foo)} -

{$a[] = 'zzz'}
{$a[10]}

{$u="something" scope=parent nocache}
{$u}

{$u = $ob.prop2.yyy|replace:"(":'['|replace:')':"]"|upper scope="global" nocache}
{$u}

{'test $foo'}
{{$foo}}

{"$foo {for $a=0 to 5}$a{/for}"}

{$num+7}


[{$num+1 == 8 && ($num < 8 || $num > 100) && 'abcdef'|count_characters == 6}]

{"test $foo {$foo}"}
{$foo|replace:'bar':$foo|upper}
{"$foo {$foo|upper}"}
{"before {for $c=1 to 7}|{$c}|{/for} after"}
{strayFunc("$foo {$foo} ",  $foo|upper)}

{$x = 10}
{$y = 20}
{$x+$y}
{$x + $y}
{$z = $x + $y}
{$z}

{$z = $foo|count_characters + 'abcdef'|count_characters + $x / 5 scope=root nocache}
{$z}

{$w = ($foo|count_characters + 'abcdef'|count_characters) + $x/5 nocache}
{$w} //==11

{(($foo|count_characters + 'abcdef'|count_characters)-7) + $x/5}

{function name='retX'}{$x}{/function}|
{(($foo|count_characters + 'abcdef'|count_characters)-{retX x=7}) + $x/5}


{$y + "12"|replace:2:5}

{strayFunc('a','b')|upper}

{strayFunc('a','b')|upper|replace:',':':'}

{"{sayHello to='everybody'}|upper"}		//modifier is NOT applied!

{{sayHello to='everybody'}|upper|replace:'EVERYBODY':$foo}