{$foo}
{setfilter replace:'bar':'zar'|replace:'zar':'gar'}-
	[{$foo}] [{'bar'}] [{strayNoArgs()}]
	[{setfilter replace:'bar':'2nd'} [{$foo}] {/setfilter}]
-{/setfilter}{$foo}