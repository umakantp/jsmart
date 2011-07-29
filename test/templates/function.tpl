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