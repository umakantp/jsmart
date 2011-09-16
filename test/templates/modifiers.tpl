{"foo"|upper}
{"it\"s O\"K for double quotes"|upper}
{'foo'|upper}
{'it\'s O\'K for single quotes'|upper}
{$foo|upper}
{$ob.prop2.txt|upper}
{$ob['prop2']['txt']|upper}

{strayFunc($foo|upper,'THIS SHOULD BE IN \'LOWER\' CASE'|lower)} -

{strayFunc("this should be in \"upper\" case"|upper,$foo|lower)} -

Long text contains [{$long_text|count_paragraphs}] paragraphs

Long text contains [{$long_text|count_sentences}] sentences

Long text words [{$long_text|count_words}] words

Long text words [{$long_text|count_characters}] characters

Long text words [{$long_text|count_characters:true}] characters with whitespaces

Long text with line breaks converted to BRs [{$long_text|nl2br}]

{"should remain lower"|upper|lower}

{"MUST REMAIN UPPER"|upper|lower|upper|lower|upper}

[{'spacifyme'|spacify}]
[{'spacifyme'|spacify:"^^"}]
[{'spacifyme with underscores'|spacify:"_"|upper}]

{"next x-men film, x3, delayed last7"|capitalize}
{"next x-men film, x3, delayed last7"|capitalize:true}

{"1st num8er 3x 3zz 3numbers1n1word"|capitalize:true}	{*"3numbers1n1word"|capitalize  - Smarty renders this capitalized, bug?*}

{strayFunc($long_text|capitalize:false|spacify:"_",'word with num8ers so! try@ ot#er s%mbols aa^bb cc&dd eee*f (parentheses)'|capitalize:false)} -
{strayFunc($long_text|capitalize:false|spacify:"_",'word with num8ers so! try@ ot#er s%mbols aa^bb cc&dd eee*f (parentheses)'|capitalize:true)} -

{$foo|cat:' yesterday.'|cat:"add another"|cat}

{$foo|default:'no value'}
{$nullVar|default:'this variable is null'}
{$sEmpty|default:'empty string'}
{'abc'|default:'def'}
{"abc"|default:"def"}
{$noSuchVal|default:'no such value'}
{$ob.prop7|default:'no such property'}


{$long_text|indent:4:'-'}
{$foo|indent:2:'-'}

{$foo|regex_replace:'/b/':'z'}
{'Abcdef abcdefabcAbc'|regex_replace:'/abc/i':'ZZZ'}
{$long_text|regex_replace:'/\\s/':'_'}
{$ob.prop2.num|regex_replace:'/\\d/':'X'}

{$foo|replace:'b':'z'}
{$long_text|replace:'sentence':'short sentence'}
{$t = 'abc|def:ghi'}
{$t|replace:'abc|d':'abc:d'}
{'abcd\'|abcd'|replace:'d':'x'}
{'$fake|replace:f:c'}

{$long_text|strip}
{$long_text|strip:'-'}

{'Woman Gets <font face="helvetica">New Kidney</font> from Dad she Hasn\'t Seen in <b>years</b>.'|strip_tags}
{'Woman Gets <font face="helvetica">New Kidney</font> from Dad she Hasn\'t Seen in <b>years</b>.'|strip_tags:false}

{$long_text|truncate:10:"---":true}
{'Two Sisters Reunite after Eighteen Years at Checkout Counter.'|truncate:30}
{'Two Sisters Reunite after Eighteen Years at Checkout Counter.'|truncate:30:""}
{'Two Sisters Reunite after Eighteen Years at Checkout Counter.'|truncate:30:"":true}
{'Two Sisters Reunite after Eighteen Years at Checkout Counter.'|truncate:30:"---":true}
{'Two Sisters Reunite after Eighteen Years at Checkout Counter.'|truncate:30:"..":true:true}
{'Two Sisters Reunite after Eighteen Years at Checkout Counter.'|truncate:30:".":true:true}
{$long_text|truncate:14:"...":true:true}
{'aaaa'|truncate:3:".....":true}
{$long_text|truncate:10}

{'Two Sisters Reunite after Eighteen Years at Checkout Counter.'|wordwrap:10:"|\n"}
{$long_text|wordwrap:20}
-
{$verylongtxt = 'Smarty is a template engine for PHP. More specifically, it facilitates a manageable way to separate application logic and content from its presentation. This is best described in a situation where the application programmer and the template designer play different roles, or in most cases are not the same person.'}
{$verylongtxt|wordwrap:40:'ZZZ'}

{$verylongtxt|wordwrap:40:"\n"}

{$verylongtxt|wordwrap:40:"\n":true}

{$vlword = 'A very long woooooooooooord.'}
[{$vlword|wordwrap:8:"\n":false}]
[{$vlword|wordwrap:8:"\n":true}]