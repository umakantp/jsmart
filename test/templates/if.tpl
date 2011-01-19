{if $ob.prop2.txt == 'zzz'}
   error
{elseif $ob.prop2.num eq 777}
	{if $ob.prop2.txt == 'txt'}
		{if $ob.prop2.bool_true}
			OK
		{/if}
	{/if}
{/if}

{if $ob.prop2.txt neq 'txt'}
   error
{else}
	{if !$ob.prop2.bool_true}
		error
	{elseif $ob.prop2.num is not even}
		OK
	{/if}
{/if}

aa{if $ob.prop2.bool_true}
   true
{else}
   false
{/if}
abc