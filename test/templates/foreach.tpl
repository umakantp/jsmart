{foreach $o as $k => $v}
	[{$v@index}] {$k}:{$v}
{/foreach}
------------------------------------------
{foreach		
	$o		as		$k		=>		$v}
	[{$v@index}] {$k}:{$v}
{/foreach}
------------------------------------------
{$v@index}
{$k}
{$v}
------------------------------------------

{foreach $a as $vvv}
	|{$vvv}|
{/foreach}


{foreach $a as $i}{$i}{foreachelse}
error
{/foreach}

{foreach $aEmpty as $k => $v}
	error
{foreachelse}
	no array
{/foreach}

{foreach $aEmpty as $k => $v}error{foreachelse}no array{/foreach}

{foreach $ob as $k => $v}
	{if $v@index eq 1}   {* this is object *}
		{if $v.bool_true}
			[{$v.txt}]
		{/if}
	{/if}
	
	{if $v@iteration == 2}
		{foreach $v as $vv}
			{$vv}
		{/foreach}
	{/if}
	
	{if $v@first}
		this is first
	{/if}
	
	{if $v@last}
		this is last
	{/if}
	
{/foreach}

{if $v@show}
	foreach was shown
{/if}


index:[{$v@index}]
iteration:[{$v@iteration}]
total:[{$v@total}]


{foreach $a as $k => $v}
	{$k+1}: {$v}
{/foreach}

this is just@total text@index


{assign var="idx" value=$v@total}

idx:[{$idx}]


{foreach from=$a key=mykey item=myitem}
	[{$mykey}]:[{$myitem}]
{/foreach}


{foreach from=$o item=myitem}
	[{$myitem}]
{/foreach}


{foreach from=$a key='mykey' item='myitem'}
	[{$mykey}]:[{$myitem}]
{/foreach}

{foreach from=$a item="myiiii" name='smarty2'}
	{$smarty.foreach.smarty2.index}|{$smarty.foreach.smarty2.iteration}|{$smarty.foreach.smarty2.first}|{$smarty.foreach.smarty2.last} [{$myiiii}]
{/foreach}

[{$smarty.foreach.smarty2.show}] [{$smarty.foreach.smarty2.total}]

______________________________ not array ________________________

{foreach from=$num item='myitem'}
	[{$myitem}]
{/foreach}

{foreach $num as $k => $v}
	[{$v@index}] {$k}:{$v}
{/foreach}

{foreach from=$num key='k' item='myitem'}
	[{$k}: {$myitem}]
{/foreach}

{foreach from=777 item='myitem'}
	[{$myitem}]
{/foreach}

{foreach from='abcdef' item='myitem'}
	[{$myitem}]
{/foreach}

{foreach from=ghijkl item='myitem'}
	[{$myitem}]
{/foreach}