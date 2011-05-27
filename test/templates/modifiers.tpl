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

{*sayHello|upper to='me'*}