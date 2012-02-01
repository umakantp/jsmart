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

{$test_with_code={sayHello to='whole world'}}
{$test_with_code}

{strayFunc($ob.prop2.txt,$foo)}-

{$textWithTags = 'Woman Gets <font face="helvetica">New Kidney</font> from Dad she Hasn\'t Seen in <b>years</b>.'}
{$textWithTags}

{$textWithTags = "double \"quotes\" inside"}
{$textWithTags}

{strayFunc($ob.prop2['txt'],$foo)} -

--------------------adding to array-------------------------
{$a[] = 'zzz'}
{$a[10]}
{$a[].ttt = 'vvvvv'}
{$a[11].ttt}
---------------------------------------------

{$u="something" scope=parent nocache}
{$u}

{$u = $ob.prop2.yyy|replace:"(":'['|replace:')':"]"|upper scope="global" nocache}
{$u}

{'test $foo'}
{{$foo}}

{"$foo {for $i=0 to 5}$i{/for}"}

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

{$aaa = ['abcd',$foo,"{$foo|upper}"]}
{$aaa[0]}
{$aaa[2]}

{$aaa = ['y'=>'yellow','b'=>'blue']}
{$aaa.y} {$aaa.b}

{$aaa = [y=>'yellow',b=>'blue']}
{$aaa.y} {$aaa.b}

{$aaa = ["y"=>"[$foo]","b\"b"=>$foo|upper,"{$foo|upper}"]}
{$aaa.y} {$aaa['b"b']} {$aaa[0]}

{"[`$ob.prop2.txt`]"}
{"`{$foo} code here|upper`"} 
{"[`$foo|replace:b:z`]"} 
{"[`$num + 3`]"}
{"[`{sayHello to='world'}`]"}

{$pr = 'prop1'}
{$ob.$pr}

{$propName = 'txt'}
{$ob.prop2[$propName]}
{$ob.prop2.$propName}

{$prop1Name = 'PROP1'}
{$ob[$prop1Name|lower]}

{$a[$num+2-1]}

{$ob.prop2.zzz.yyy = 'yyy'}
{$ob.prop2.zzz.yyy}

{$ob['prop2']['zzz']["yyy"] = 'new val'}
{$ob.prop2.zzz.yyy}

{$ob.NEWPROP = 'TEST!'}
{$NewPropName = 'neyprop'}
[{$ob[{$NewPropName|upper|replace:'Y':'W'}]}]


{70|replace:7:8 + 1}

{$testClassObj->prop}
{$testClassObj->func('call member func PHP style')}
{$testClassObj->obData.ob1}
{$testClassObj->obData.ob2.value}
{$testClassObj 
	-> 
obData.ob2.value}

{$y=0}
{$y++}
{$y++}

{$x=1}
{$x++}
{$x++}

{$sss = '77777777777777777777'}
{$sss}