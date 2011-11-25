{$num|string_format:"[%d]"}

{$number = 23.5787446}
{$number}
{$number|string_format:"%.2f"}
{$number|string_format:"%d"}
{5|string_format:"[%d]"}


{'&"\'<>'|escape}
{'&\'<>'|escape:htmlall}
{'<b>text_to_replace</b>'|replace:'text_to_replace':'replaced'|escape:htmlall}

{'url&#$_ -+='|escape:url}

{'abcd/url&#$_ -+=/efgh'|escape:urlpathinfo}

{"ab'cd"|escape:quotes}
{"ab\'cd"|escape:quotes}

{"abcdef67832*@%^%&^"|escape:hex}

[{"abcdef67832*@%^%&^"|escape:hexentity}]

{"abcdef67832*@%^%&^"|escape:decentity}

{"<a\"b'c/>"|escape:javascript}

{'billgates@microsoft.com, stevejobs@apple.com'|escape:mail}

{$time = 1314697269}
{$time|date_format}
{$time|date_format:"%D"}
{$config = "%A, %B %e, %Y"}
{$time|date_format:$config}
{$time|date_format:'%I:%M %p'}
{$time|date_format:'%H:%M:%S'}
{"6/3/1976"|date_format:'%A, %B %e, %Y'}
{"6/3/1976 13:13:13"|date_format:'%H:%M %A, %B %e, %Y'}
{"19760603131313"|date_format:'%H:%M %A, %B %e, %Y'}	//mysql timestamp format of YYYYMMDDHHMMSS


---------- escape HTML --------------------
[{$escapeHtml}]
