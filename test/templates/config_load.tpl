{config_load file="$testPath/test.conf" section=Customer}-
{#pageTitle#}
{$smarty.config.pageTitle}
------------------------------------------------------------

{config_load "$testPath/test.conf" 'Login'}

{function testX}[{$x}]{/function}

{testX x=#pageTitle#}
{testX x='#pageTitle#'}
{testX x="#pageTitle#"}
{testX x="{#pageTitle#}"}
{testX x={#pageTitle#}}

[{#abcdef#}]

{#abcdef#|upper|replace:'efqwefewq':'zzz'}

{config_load "$testPath/test.conf" '.Database'}-

{#host#|default:'no host'}