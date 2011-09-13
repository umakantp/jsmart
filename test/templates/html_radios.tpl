{$ids = [1000,1001,1002,1003]}
{$names = ['Joe Schmoe','Jack Smith','Jane Johnson','Charlie Brown']}
{$customer_id=1001}
{html_radios name='id' values=$ids output=$names selected=$customer_id separator='<br />'}

{$values = ['a','b']}
{$output2 = ['x'=>'out1','y'=>'out2']}
{html_radios values=$values output=$output2}

{$options = [aaa=>'a', bbb=>'b', ccc=>'c']}
{html_radios options=$options separator='|' assign='radiotags'}
{foreach $radiotags as $tag}
	[{$tag}]
{/foreach}