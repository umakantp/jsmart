jsmart
======

jSmart is a port of the Smarty Template Engine to Javascript, a JavaScript template library that supports the template [syntax](https://github.com/umakantp/jsmart/wiki/syntax) and all the features (functions, variable modifiers, etc.) of the well-known PHP template engine [Smarty](http://www.smarty.net/).

jSmart is written entirely in JavaScript, does not have any DOM/DHTML/browser or third-party JavaScript library dependencies and can be run in a web browser as well as a standalone JavaScript interpreter or [CommonJS](http://www.commonjs.org/) environments like [node.js](http://nodejs.org/).

jSmart supports plugin architecture, you can [extend it with custom plugins](https://github.com/umakantp/jsmart/wiki/Create-Plugin): functions, blocks and variable modifiers, [templates inclusion](https://github.com/umakantp/jsmart/wiki/Include-Templates), [templates inheritance](https://github.com/umakantp/jsmart/wiki/Template-Inheritance) and overriding, [caching](https://github.com/umakantp/jsmart/wiki/Caching), [escape HTML](https://github.com/umakantp/jsmart/wiki/escape_html).

jSmart has some limited support of the [PHP Smarty syntax](https://github.com/umakantp/jsmart/wiki/syntax) and allows you to [use the same Smarty templates on both server and client side](https://github.com/umakantp/jsmart/wiki/Smarty-template-in-javascript), for both PHP and Javascript.


### A Quick Introduction

1. Include jSmart library Javascript file in your header (get the current release by cloning this repo)

        <html>
            <head>
                <script language="javascript" src="jsmart.js"></script>
            </head>

2. Create template, use [PHP Smarty syntax](https://github.com/umakantp/jsmart/wiki/syntax). Put the template's text in _&lt;script&gt;_ with the _type="text/x-jsmart-tmpl"_ so a browser will not try to parse it and mess it up.

        <script id="test_tpl" type="text/x-jsmart-tmpl">

            <h1>{$greeting}</h1>

            {foreach $books as $i => $book}
                <div style="background-color: {cycle values="cyan,yellow"};">
                    [{$i+1}] {$book.title|upper} by {$book.author}
                        {if $book.price}
                            Price: <span style="color:red">${$book.price}</span>
                        {/if}
                </div>
            {foreachelse}
                No books
            {/foreach}

            Total: {$book@total}

        </script>

3. Create JavaScript data object with variables to assign to the template

        <script>
            var data = {
                greeting: 'Hi, there are some JScript books you may find interesting:',
                books : [
                    {
                        title  : 'JavaScript: The Definitive Guide',
                        author : 'David Flanagan',
                        price  : '31.18'
                    },
                    {
                        title  : 'Murach JavaScript and DOM Scripting',
                        author : 'Ray Harris',
                    },
                    {
                        title  : 'Head First JavaScript',
                        author : 'Michael Morrison',
                        price  : '29.54'
                    }
                ]
            };
        </script>

4. Create new object of _jSmart_ class, passing the template's text as it's constructor's argument than call _fetch(data)_, where data is an JavaScript object with variables to assign to the template

        <script>

            var tplText = document.getElementById('test_tpl').innerHTML;

            var tpl = new jSmart( tplText );

            var res = tpl.fetch( data );

            /*
             or fetch straigth from JavaScript string
            var res = document.getElementById('test_tpl').innerHTML.fetch(data);
            */

            document.write( res );

        </script>

5. The result would be

        <h1>Hi, there are some JScript books you may find interesting:</h1>

        <div style="background-color: cyan;">
            [1] JAVASCRIPT: THE DEFINITIVE GUIDE by David Flanagan
            <span style="color:red">$31.18</span>
        </div>

        <div style="background-color: yellow;">
            [2] MURACH JAVASCRIPT AND DOM SCRIPTING by Ray Harris
        </div>

        <div style="background-color: cyan;">
            [3] HEAD FIRST JAVASCRIPT by Michael Morrison
            <span style="color:red">$29.54</span>
        </div>

        Total: 3

6. The template's text is compiled in the _jSmart_ constructor, so it's fast to call _fetch()_ with different assigned variables many times.

        var tpl = new jSmart( '{$greeting}, {$name}!' );

        tpl.fetch( {greeting:'Hello', name:'John'} ); //returns: Hello, John!

        tpl.fetch( {greeting:'Hi', name:'Jane'} );    //returns: Hi, Jane!


### NOTICE

This project was originally hosted at [Google code](http://code.google.com/p/jsmart/) and was created by [miroshnikov](https://github.com/miroshnikov).
Since author was not very active on project. I have forked and planned on pushing further improvements and features.

