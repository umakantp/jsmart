
{section name='sectionTest' loop=$o max=3}
	{$o[sectionTest]}
{/section}

{if $smarty.section}
	{if $smarty.section.sectionTest.show}
	  the section was shown.
	{/if}
{else}
	{if $sectionTest@show}
	  the section was shown.
	{/if}
{/if}

{section name='sectionTest' loop=$o}
	{$o[sectionTest]}
{/section}

{section name='sectionTest' loop=$o start=2 step=-1 show=true}
	{$o[sectionTest]}
{sectionelse}
	no section
{/section}

{section name='st' loop=$a start=3 step=2}
	{$a[st]}
{sectionelse}
	no section
{/section}

{section name='st' loop=$a start=-3 step=-2}
	{$a[st]}
{sectionelse}
	no section
{/section}

{section name='sectionTest' loop=$o start=2 step=-1 show=false}
	{$o[sectionTest]}
{/section}

{if $smarty.section}
	{if !$smarty.section.sectionTest.show}
	  the section was NOT shown.
	{/if}
{else}
	{if !$sectionTest@show}
	  the section was NOT shown.
	{/if}
{/if}

{section name='sectionTest' loop=$o start=2 step=-1 show=false}
	{$o[sectionTest]}
{sectionelse}
	show == false
{/section}

{section name='sectionTest' loop=$aEmpty start=2 step=-1}
	{$o[sectionTest]}
{sectionelse}
	empty array
{/section}

{section name='sectionTest' loop=10 step=2}
	|
{/section}

{section name='sectionTest' loop=10 start=2 step=2 show=true}
  |
{/section}

{section name='sectionTest' loop=10 start=2 step=2 show=true max=2}
	|
{/section}

{section name='sectionTest' loop=10 start=-2 step=-1 show=true}
	|
{/section}


{section name='st1' loop=$o}
	{if $smarty.section}
		{$smarty.section.st1.index}
	{else}
		{$st1@index}
	{/if}
	
	{if $smarty.section}
		{$smarty.section.st1.index_prev}
	{else}
		{$st1@index_prev}
	{/if}	
	
	{if $smarty.section}
		{$smarty.section.st1.index_next}
	{else}
		{$st1@index_next}
	{/if}
	
	{if $smarty.section}
		{$smarty.section.st1.iteration}
	{else}
		{$st1@iteration}
	{/if}
	
	{if $smarty.section}
		{if $smarty.section.st1.first}
			first
		{/if}
	{else}
		{if $st1@first}
			first
		{/if}
	{/if}
	
	{if $smarty.section}
		{if $smarty.section.st1.last}
			last
		{/if}
	{else}
		{if $st1@last}
			last
		{/if}
	{/if}
	
	{if $smarty.section}
		{$smarty.section.st1.rownum}
	{else}
		{$st1@rownum}
	{/if}
	
	{if $smarty.section}
		{$smarty.section.st1.loop}
	{else}
		{$st1@loop}
	{/if}
	
	{if $smarty.section}
		{$smarty.section.st1.total}
	{else}
		{$st1@total}
	{/if}

{/section}

{if $smarty.section}
	{$smarty.section.st1.total}
{else}
	{$st1@total}
{/if}


-{*  error in smarty
{section name='sectionTest' loop=10 start=2 step=2 show=true}
  |
{/section}
{if $smarty.section}
	{$smarty.section.sectionTest.loop}
{else}
	{$sectionTest@loop}
{/if}
*}-
