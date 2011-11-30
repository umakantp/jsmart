------
{for $i=-5 to -3 step -1} 
	{$i}
{/for}

{for $i=-5 to -3 step 2} 
	{$i}
{/for}

{for $i=20 to 0} 
	{$i}
{/for}

{for $i=20 to 5 step -1} 
	{$i}
{/for}

{for $i=-10 to -1}
	{$i}
{/for}

{for $i=10 to 1 step -2}
	{$i}
{/for}

{for $i=-10 to -20 step -2}
	{$i}
{/for}

{for $i=-20 to -10 step 2}
	{$i}
{/for}

{for $i=1 to 10}
	{$i}
{/for}

{for $i=1 to 15 step 2}
	{$i}
{/for}

{for $i=1 to 255 step 4 max=20} 
	{$i}
{/for}

----------------------
{$forFrom = 1}
{$forTo = 7}
{$forStep = 1}
{$forMax = 6}
{for	$i=$forFrom 	to  $forTo step      $forStep     max=$forMax} 
	{$i}
{/for}
----------------------
{for $i=1 to $forTo step "2" max=20} 
	{$i}
{/for}
----------------------
{for $i=0 to 10}
	{if $i == 3}
		skip 3
		{continue}
	{/if}
	{if $i == 5}
		last 5
		{break}
	{/if}
	[{$i}]
{/for}
--------------------