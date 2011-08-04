-{block name="b1"}parent 1{/block}-
-{block name="b2"}parent 2{/block}-
-{block name="b3"}parent 3{/block}-
<h1>
   Hello from {block name="hello"}parent template{/block}!
</h1>
-{block name='b4'}Hello{/block}-



//child
-{block name='b6'}[{$smarty.block.child}]{/block}-
-{block name='b7'} p7 {/block}-
-{block name='b8'} p8 {/block}-
-{block name='b9'} |{$smarty.block.child}| {/block}-
-{block name='b10'} <{$smarty.block.child}> {/block}-



//parent
-{block name='b5'}parent 5{/block}-
-{block name='b5.2'}parent 5.2{/block}-
-{block name='b5.3'}parent 5.3{/block}-

{$someBool = true}
{block name='outblock'} 
	[{block name='inblock'} 
		{if $someBool}
			/{$smarty.block.child}/
		{/if}
	{/block}]
{/block}-

{block name='outblock1'} [{block name='inblock1'}pInblock1{/block}] {/block}-



//parent child mixed
{*  seems like the current version of Smarty has bugs here, results of child/parent/append/prepend mix are a mess, so skip the tests
-{block name='confuse'}P({$smarty.block.child}){/block}-
-{block name='withAppend'}[{$smarty.block.child}]{/block}-
*}


