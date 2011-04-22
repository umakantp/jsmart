{include file='foreach.tpl'}
{include file='capture.tpl'}
{include file='strip.tpl'}

{include file='for.tpl' assign='zzz'}
[{$zzz}]

{include file='var.tpl' zzz='assign_zzz'}
[{$zzz}]

{include file='var.tpl' foo='outer_value'}