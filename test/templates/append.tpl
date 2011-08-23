-{append var='newA' value='a'}
{append var='newA' value='b'}
{append var='newA' value='c'} {append var='newA' value='d'}
-

{foreach $newA as $k => $v}
	[{$k}]: {$v}
{/foreach} 

{append var='a' value='10'}

{foreach  $newA  as  $v}
	{$v} 
{/foreach} 

________________________________


{* seems like index attribute is not supported in PHP Smarty 
{append var='a' value='15' index=15}
*}



________________________________