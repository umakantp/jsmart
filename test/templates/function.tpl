
-{function name="testFunc1"}
	[this is function]
{/function}-

{testFunc1}

-{function name="testFunc2" parStr='test' parNum=777}
	[this is function with params {$parStr} {$parNum} ]
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

