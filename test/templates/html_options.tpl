{$options = [1800 => 'Joe Schmoe', 2003 => 'Charlie Brown', 9904 => 'Jack Smith']}
{html_options options=$options}

{$selected = '9904'}
{html_options options=$options selected=$selected name='mySelect'}

{$values = ['golf', 'cricket', 'swim']}
{$output = [6 => 'Golf', 7 => 'Swim', 9 => 'Cricket']}
{html_options values=$values output=$output}