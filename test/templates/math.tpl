{$height=4}
{$width=5}

{math equation="x + y" x=$height y=$width}

{math 
   equation="height * width / division"
   height=10
   width=20
   division=10
   assign='mathRes'
   format='|%d|'}
   
[{$mathRes}]

{$x = -1}
{math equation="abs(x)" x=$x}

{$x = 3.14}
{math equation="ceil(x)" x=$x}

{$x = 200}
{math equation="round(cos(x))" x=$x}

{math equation='round(pi())'}