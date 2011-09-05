{if $foo == 'bar'}
	ok1
{else}
	er
{/if}

{if $foo}foo {if $nullVar}bar{else}nobar{/if}{/if}

{if $foo != 'bar'}
	er1
{elseif $foo == 'abc'}
	er2
{else}
	ok2
{/if}

{if $foo != 'bar'}
	er11
{elseif $foo == 'abc'}
	er22
{elseif $foo == 'zzz'}
	er33
{elseif $foo == 'zzz'}
	er44
{else}
	{if $foo == 'bar'}
		ok3
	{/if}
{/if}

{if $foo != 'bar'}
	er
{elseif $foo == 'bar'}
	ok4
{/if}

{if $ob.prop2.txt == 'zzz'}
   error
{elseif $ob.prop2.num eq 777}
	{if $ob.prop2.txt == 'txt'}
		{if $ob.prop2.bool_true}
			OK
		{/if}
	{/if}
{/if}

{if $ob.prop2.txt neq 'txt'}
   error
{else}
	{if !$ob.prop2.bool_true}
		error
	{elseif $ob.prop2.num is not even}
		OK
	{/if}
{/if}

{if $ob.prop2.txt|upper eq 'TXT' && 4 IS EVEN && 7 is not even && 5 is odd && 6 is NOT odd}
	{$ob.prop2.txt|upper}
{/if}

{if 20 is div by 10 and 55 IS NOT DIV BY 3 and $num is odd}
	{20 is div by 10 and 55 IS NOT DIV BY 3 and $num is odd}
{/if}

{if 30 is even by 5  and  25 is NOT even by 5  and 15 is odd by 3   and   60 is  not  odd  by  10}
	even by / odd by OK
{/if}

aa{if $ob.prop2.bool_true}
   true
{else}
   false
{/if}
abc

{if 'ok'}
	'ok'
{else}
	no 'ok'
{/if}

{if "ok"}
	"ok"
{else}
	no "ok"
{/if}

{if "ok"|replace:'ok':'yes'|upper == 'YES'}
	YES
{else}
	no YES
{/if}

{if $foo|upper|replace:'B':'[B'|replace:'R':'R]' == '[BAR]'}
	[BAR]
{else}
	no [BAR]
{/if}

{if $foo|upper|replace:'B':'[B'|replace:'R':'R]' == '[BAR]' && 'abcd'|replace:'ab':'xy'|upper == 'XYCD'}
	[BAR] XYCD
{else}
	no [BAR2] XYCD
{/if}

{if $noVal|default:false}
	error
{else}
	no such value
{/if}

{if $sEmpty}
	error
{else}
	empty string
{/if}

t():[{isEmptyStr s=''}]   		//1
f():[{isEmptyStr s='abc'}]   	//empty string

{if 'false'}
	'false'
{else}
	er
{/if}

{if "false"}
	"false"
{else}
	er
{/if}

{$b = "{isEmptyStr s='abc'}"}
{if $b}
	'abc' is not empty
{else}
	er
{/if}


{$b = "{isEmptyStr s=''}"}
{if $b}
	now empty!
{else}
	er
{/if}



{$a = 'aaa'}
t:[{$a == 'aaa'}]		  		//1

f:[{$a != 'aaa'}]		  		//empty string



{if "{for $ccc=1 to 7}{$ccc}{/for}" == '1234567'}
	1234567
{else}
	no 1234567
{/if}



{if {isEmptyStr s=""}}
	code2
{else}
	no code2
{/if}

{if {sayHello to='world!'} == 'Hello world!'}
	code3
{else}
	no code3
{/if}


{if {sayHello to='world!'} == 'Hello world!' && "{for $ccc=1 to 7}{$ccc}{/for}" == '1234567' && $foo|replace:$foo:'ZZZ' == 'ZZZ'}
	OK
{else}
	err
{/if}


{if true xor false}
	OK
{else}
	err
{/if}

{if true XOR $foo}
	err
{else}
	OK
{/if}

{if nullVar XOR false}
	err
{else}
	OK
{/if}
