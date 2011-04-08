
{foreach $o as $k => $v}
	[{$v@index}] {$k}:{$v}
{/foreach}

{$v@index}
{$k}
{$v}


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
		this is first
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
