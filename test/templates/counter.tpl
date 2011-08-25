{counter name='c1' start=100 skip=2 direction='down'}-
{counter name='c1'}-
{counter name='c1'}-
{counter name='c1' direction='up'}-
{counter name='c1'}-

{counter start=5 skip=2}-
{counter start=7 skip=2}-

{counter start=0 skip=2}
{counter}
{counter skip=3}
{counter}

{foreach $a as  $i}
[{counter name='c2' assign='zzz'}]
{/foreach}

{$zzz}

{counter name='c2' assign='xxx'}

zzz:[{$zzz}]
xxx:[{$xxx}]

{counter name='c2'}

xxx:[{$xxx}]

{$v = 10}
{counter name='c3' start=$v skip=2}
{counter name='c3'}

{counter name='c3' print=false}

{counter name='c3' print=FALSE}
