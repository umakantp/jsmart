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

Long text with line breaks converted to BRs [{$long_text|nl2br}]

{"should remain lower"|upper|lower}

{"SHOULD REMAIN UPPER"|upper|lower|upper|lower|upper}

[{'spacifyme'|spacify}]
[{'spacifyme'|spacify:"^^"}]
[{'spacifyme with underscores'|spacify:"_"|upper}]

{"next x-men film, x3, delayed."|capitalize}

{"1st num8er 3x 3zz"|capitalize}

{"next x-men film, x3, delayed."|capitalize:true}

{strayFunc($long_text|capitalize:false|spacify:"_",'word with num8ers so! try@ ot#er s%mbols aa^bb cc&dd eee*f (parentheses)'|capitalize:false)} -

{*sayHello|upper to='me'*}