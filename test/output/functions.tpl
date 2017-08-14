--

[[this is function]
global variable $ob.prop2.txt is txt
]

--

[this is function with params test 777 ]
and global variable $ob.prop2.num is 777


[this is function with params new str 777 ]
and global variable $ob.prop2.num is 777



[this is function with params str in var 888 ]
and global variable $ob.prop2.num is 777



--

[this is function without default params]
str

[this is function without default params]
str_without_quotes


-
-
 [abc"def] [ghi'jkl] -

-

[abcdef]

[{if $foo}aaa{else}zzzz{/if}]	//not parsed!

[abcdef]

[abcdef]

[bar]

[bar]

[ZZZ]    //variable

[bar,abc]   //variable

[bar]

[zar]

[before aaa |1||2||3||4||5||6||7| after]    //template

[1]

[1]

[1]

[1]

[]

[]

[!@#$%^&*()]

 //param is an Object
- txt -
- txt -

 //param is an Object's property
 property: txt -

  // change local object
  zzzz -
bar

   // set new property
  new -

-
1

true
false
true
false



-
[A B'CD]
[XY'CD]
[{$FOO}]
[ b ' b ]
[a " a]
[B { a } R]

[2]
[5]

7

[7]

[A Z B]
[a|upper]
[ab2cdAs]
[abcd]

[1]
[Hello world]
[Hello BAR]
[3]

[bar,abc]
[a,b]

[|bar|]
[|txt|]
[A B]
[BAR,=a=]
[a|upper]
[a + b]
[a b]
[a B]
[4 a]
[ 123 ]
[12345 a|upper B]
[ab5cd]
[ab6cda s]

[bar bar ,BAR]
[Hello world]
[Hello bar BAR]
[[bar]]
[BAR]
[bar|replace : 'bar' : bar|upper]

38

[[x]]
[[A]]

[ABCD]

-

[0: ab]
[1: bar]
[2: bar]
[3: bar]

[0: nnnnn]
[abc: aaa]
[bbb: zzz]


[test]
-
