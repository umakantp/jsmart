---




{capture name='testCapture1'}
this will be captured
{for $i=1 to 10}
   {$i}
{/for}
{/capture}





[{$smarty.capture.testCapture1}]

{capture name='withTextarea'}
   <textarea>
      test test test
   </textarea>
{/capture}

[{$smarty.capture.withTextarea}]

{capture name='testCapture2' assign='captureA'}
this will be captured into variable
{foreach $o as $i}{$i}{/foreach}
{/capture}

{$captureA}

{$arr = []}
{capture name='testCapture3' append='arr'}aaa{/capture}
{capture name='testCapture4' append='arr'}bbb{/capture}
{foreach $arr as $i}
	[{$i}]
{/foreach}


{capture name='testCapture5' append='newA'}
this will be captured into new array
{foreach $o as $i}{$i}{/foreach}
{/capture}

{capture name='testCapture6' append='newA'}
this will be captured into new array
{foreach $o as $i}{$i}{/foreach}
{/capture}

--
{foreach $newA as $i}{$i}{/foreach}
--

{capture testC}
	teeest
{/capture}
{$smarty.capture.testC}