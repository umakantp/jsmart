{literal}                                                  
   There are some {JScript} books you may find interesting:
{/literal}                                                 

{foreach $books as $i => $book}
	<div style="background-color: {cycle values="cyan,yellow"};">
		[{$i+1}] {$book.title} by {$book.author} 
		{if $book.price}                                
			<span style="color:red">${$book.price}</span>
		{/if}                                           
	</div>
{foreachelse}
	No books
{/foreach}

Total: {$book@total}