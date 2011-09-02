-{function name="testFunc1"}
	[this is function]
	global variable $ob.prop2.txt is {$ob.prop2.txt}
{/function}-

[{testFunc1}]

-{function name="testFunc2" parStr='test' parNum=777}
	[this is function with params {$parStr} {$parNum} ]
	and global variable $ob.prop2.num is {$ob.prop2.num}
{/function}-

{testFunc2}

{testFunc2 parStr='new str'}

{$xxx = 'str in var'}
{$yyy = 888}

{testFunc2 parStr=$xxx parNum=$yyy}


-{function name="testFunc3"}
	[this is function without default params]
	{$par}
{/function}-

{testFunc3 par='str'}
{testFunc3 par=str_without_quotes}

{function name="testFunc4" parStr1="abc\"def"} [{$parStr1}] [{$parStr2}] {/function}-
-
{testFunc4 parStr2='ghi\'jkl'}-

{function name="testFunc5"}[{$par}]{/function}-

{testFunc5 par='abcdef'}

{testFunc5 par='{if $foo}aaa{else}zzzz{/if}'}	//not parsed!

{testFunc5 par="abcdef"}

{testFunc5 par=abcdef}

{testFunc5 par="$foo"}

{testFunc5 par=$foo}

{testFunc5 par=$foo|replace:'bar':'ZZZ'}	//variable

{testFunc5 par=strayFunc($foo,'abc')}		//variable

{testFunc5 par="before {if $foo}aaa{else}zzzz{/if} {for $ccc=1 to 7}|{$ccc}|{/for} after"}	//template

{testFunc5 par={counter}}

{testFunc5 par=true}

{testFunc5 par=TRUE}

{testFunc5 par=TRue}

{testFunc5 par=false}

{testFunc5 par=falsE}

{$ob[':strange : param* | $name| @ [(name)]'] = '!@#$%^&*()'}
{testFunc5 par=$ob[':strange : param* | $name| @ [(name)]']}

{function name="testFunc6"} {$par.prop2.txt} {/function}	//param is an Object
{testFunc6 par=$ob}
{testFunc6 par="$ob"}

{function testFunc7} property: {$par.txt} {/function}	//param is an Object's property
{testFunc7 par=$ob.prop2}

{function 'testFunc8'} {$par.prop2.txt = 'zzzz'} {$par.prop2.txt} {/function}  // assign property
{testFunc8 par=$ob}

{function "testFunc9"} {$par.prop3 = 'new'} {$par.prop3} {/function}  // set new property
{testFunc9 par=$ob}

{function name="testBool"}{if $b}{$b}{/if}{/function}-
{testBool b=true}
{testBool b=false}
{testBool b='true'}
{testBool b='false'}
{testBool b="true"}
{testBool b="false"}



{function name="testX"}[{$x}]{/function}-
{testX x='a b\'cd'|upper}
{testX x='a b\'cd'|replace:'a b':'xy'|upper|replace:"xy":"A|B|C"}
{testX x='{$foo}'|upper}
{testX x='a\'a'|replace:'a':' b '}
{testX x='a\'a'|replace:"'":' " '}
{testX x=$foo|replace:'bar':'b a r'|upper|replace:'A':"{ a }"}

{testX x=$a[2]}
{$i=5}
{testX x=$a[$i]}

{$ob.prop2['n'] = 7}
{$ob.prop2['n']}


{$a = a}
{$b = b}
{testX x="{$a} z {$b}"|upper}
{testX x="{$a}|upper"}
{testX x="ab{counter}cd{$a|upper}s"}
{testX x=abcd}

{testX x={isEmptyStr s=''}}
{testX x={sayHello to='world'}}
{testX x={sayHello to=$foo|upper}}
{testX x={counter} a='x'}

{testX x=strayFunc($foo,'abc')}
{testX x={strayFunc('a','b')}}

{testX x="|$foo|"}
{testX x="|`$ob.prop2.txt`|"}
{testX x="$a $b"|upper}
{testX x=strayFunc($foo|upper,"=$a=")}
{testX x="$a|upper"}
{testX x="$a + $b"}
{testX x="$a {$b}"}	
{testX x="$a {$b|upper}"}
{testX x="{counter} $a"}
{testX x=" {for $j=1 to 3}$j{/for} "}
{testX x="{for $z=1 to 5}{$z}{/for} $a|upper {$b|upper}"}
{testX x="ab{counter}cd"}
{testX x="ab{counter}cd$a s"}

{testX x=strayFunc("$foo {$foo} ",  $foo|upper)}
{testX x = {sayHello to='world'}}
{testX x={sayHello to="$foo {$foo|upper}"}}
{testX x=$foo|replace:'bar':"[$foo]"}
{testX x=$foo|replace:'bar':$foo|upper}
{testX x="$foo|replace : 'bar' : $foo|upper"}

{$x = 10}
{{counter name='invar'} + $x + 7 + '10'|replace:1:2}

{testX x={call name='testX' x='x'}}
{testX x={call name='testX' x="{$a|upper}"}}	

{testX x=abcd|upper}


{function testY}
	{foreach $y as $k => $v}
		[{$k}: {$v}]
	{/foreach}
{/function}-

{testY y=['ab',$foo,"$foo","{$foo}"]}