{extends file="parent.tpl"} 
ignored
{block name="b2"}child1 2{/block}
ignored
{block name="hello"}child template{/block}
{block name='b4' append}world{/block}


{block name='b6'}child1{/block}
{block name='b7' append} c1.7 {$smarty.block.child} {/block}
{block name='b8' prepend} c1.8 {$smarty.block.child} {/block}
{block name='b9'} [{$smarty.block.child}] {/block}
{block name='b10'} c1.10 {/block}



{block name='b5'}[{$smarty.block.parent}]{/block}
{block name='b5.2'}[{$smarty.block.parent}]{/block}
{block name='b5.3'}[{$smarty.block.parent}]{/block}


{block name='inblock'}c1.inblock{/block}

{block name='outblock1'}({$smarty.block.parent}){/block}
{block name='inblock1'}[{$smarty.block.parent}]{/block}



{block name='confuse'}C[{$smarty.block.parent}]{/block}
-{block name='withAppend' append}ccccc{/block}-