-{append var='newA' value='a'}
{append var='newA' value='b'}
{append var='newA' value='c'} {append var='newA' value='d'}
-

{foreach $newA as $k => $v}
	[{$k}]: {$v}
{/foreach} 

{append var='a' value='10' scope=parent}

{foreach  $newA  as  $v}
	{$v} 
{/foreach} 

{append var='a' value='15' index=10 scope=global}
{$a[10]}

{append 'name' 'Bob' index='first'}
{append 'name' 'Meyer' index='last'}

{$name.first} {$name.last}
