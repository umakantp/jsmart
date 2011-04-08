
{section name='sectionTest' loop=$o max=3}
	{$o[sectionTest]}
{/section}


{if $smarty.section.sectionTest.show}
  the section was shown.
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

{if !$smarty.section.sectionTest.show}
  the section was NOT shown.
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
	st1.index: {$smarty.section.st1.index}
	
	st1.index_prev: {$smarty.section.st1.index_prev}
	
	st1.index_next: {$smarty.section.st1.index_next}
	
	st1.iteration: {$smarty.section.st1.iteration}
	
	{if $smarty.section.st1.first}
		st1.first
	{/if}
	
	{if $smarty.section.st1.last}
		st1.last
	{/if}
	
	st1.rownum: {$smarty.section.st1.rownum}
	
	st1.loop: {$smarty.section.st1.loop}
	
	st1.total: {$smarty.section.st1.total}

{/section}

st1.total: {$smarty.section.st1.total}


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
