{$options = [aaa=>'a', bbb=>'b', ccc=>'c']}
{html_checkboxes options=$options}

{$values = ['a','b']}
{$output = ['out1','out2']}

{html_checkboxes name=mycheck values=$values output=$output}

{html_checkboxes options=$options selected='bbb'}

{html_checkboxes options=$options separator='-' labels=false}

{html_checkboxes options=$options separator='|' assign='ckeckboxtags'}

{foreach $ckeckboxtags as $tag}
	[{$tag}]
{/foreach}