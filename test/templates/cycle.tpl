{foreach $o as $i}
	[{cycle values="1,2"}]
{/foreach}

{cycle values="1,2" print=true}-

{foreach $o as $i}
	[{cycle name='c1' values="1,2" advance=false}]
{/foreach}

{foreach $a as $i}
	[{cycle name='c2' values=$a}]
{/foreach}

{foreach $a as $i}
	[{cycle name='c3' values=$a assign='zzz'}]
{/foreach}

{$zzz}

{cycle name=t values="1,2" print=false}

{cycle name=t reset=true}

{cycle name=t}

{cycle name=x values='aa,bb'}
{cycle name=x values='cc,dd'}


{cycle values='xx,yy'}
{cycle}

{cycle name=y values="aa|bb" delimiter='|'}

{cycle name=y values="aa|bb"}

{cycle name=y values="xx,yy"}

{cycle name=y values="xx,yy" delimiter=','}

{cycle name=y values="aa|bb" delimiter='|' assign=cycled}
{$cycled}

{cycle name=y values="$foo,[{$foo}]" delimiter=','}
{cycle name=y}