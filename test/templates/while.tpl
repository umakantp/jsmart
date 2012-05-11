{$num = 10}

{while $num > 0}
	|
   {$num--}
   
	{if $num == 3}
		last 3
		{break}
	{/if}
	
	{if $num == 7}
		skip 7
		{continue}
	{/if}
   ===
{/while}

{$nnn = 5}
{while $nnn-->=0}
   [{$nnn}]
{/while}