{javascript}
	var abcdef = 'test';
	if (typeof abcdef == 'string' && $foo == 'bar')
	{
		$this.$JSresult = $foo;
	}
{/javascript}
[{$JSresult}]

{$num += 3}
{$num}

{$num /= 5}
{$num}

{$num -= 1}
{$num}

{$num = 100}
{++$num}
{$num++}
{$num}
{-$num}
{-7}
{+7}