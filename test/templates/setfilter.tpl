{$foo}
{setfilter replace:'bar':'zar'|replace:'zar':'gar'}-
	[{$foo}] [{'bar'}] [{strayNoArgs()}] [{$foo nofilter}] [{strayNoArgs()  nofilter}]
	[{setfilter replace:'bar':'2nd'} [{$foo}] {/setfilter}]
-{/setfilter}{$foo}