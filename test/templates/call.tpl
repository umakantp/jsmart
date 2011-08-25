{*call name="testF"*}  //error "Call to undefined function"

{function name='testF' par='test'}from testF {$par}{/function}-

{call name=testF}

{$fname = 'testF'}
{call name=$fname}
{call name="$fname"}
{call name="{$fname}"}
{call testF}
{call "testF" par='test'}
{call $fname par='test'}

{$t = 'test'}
{call name="{$t}F" par="[{$t}]"}

{*call name="sayHello" to='world'*}	 //Error "Call to undefined function smarty_template_function_sayHello()"

{call name="{$fname}" assign=zzz par='abcd'}
-{$zzz}-
