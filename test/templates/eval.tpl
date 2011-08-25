
{eval var=$code}

{eval var=$code assign='zzz'}
{$zzz}

{eval var='*$zzz*'}

{eval var='*$zzz*' assign='xxx'}
{$xxx}

{eval var='$zzz=50'}
{$zzz}

{eval var="{for $i=1 to 5}[$i]{/for}" assign="$foo{$foo}"}
{$barbar}

{$c = '{for $i=0 to 5}[{$i}]{/for}'}
{eval var=$c}
{eval var="$c"}
{eval var="{$c}"}
{eval $c}