/** 
 * @preserve jSmart Javascript template engine
 * http://code.google.com/p/jsmart/
 *
 * Copyright 2011, Max Miroshnikov <miroshnikov at gmail dot com> 
 * jSmart is licensed under the GNU General Public License
 * http://www.apache.org/licenses/LICENSE-2.0
 */


(function() {

    /**
       merges two or more objects into one and add prefix at the beginning of every property name at the top level
       objects type is lost, prototype properties become own properties 
    */
    function obMerge(prefix, ob1, ob2 /*, ...*/)
    {
        for (var i=2; i<arguments.length; ++i)
        {
            for (var nm in arguments[i]) 
            {
                if (typeof(arguments[i][nm]) == 'object' && arguments[i][nm] != null)
                {
                    ob1[prefix+nm] = (arguments[i][nm] instanceof Array) ? new Array : new Object;
                    obMerge('', ob1[prefix+nm], arguments[i][nm]);
                }
                else
                {
                    ob1[prefix+nm] = arguments[i][nm]; 
                }
            }
        }
        return ob1;
    }

    /**
       @return  number of properties in ob
    */
    function countProperties(ob)
    {
        var count = 0;
        for (var k in ob) { count++; }
        return count;
    }

    /**
       @return  s trimmed and without quotes
    */
    function trimQuotes(s)
    {
        return s.replace(/^\s+|\s+$/g,'').replace(/^['"]{1}|['"]{1}$/g,'');
    }

    /**
       finds first {tag} in string
       @param re string with regular expression
       @return  null or s.match(re) result object where 
       [0] - full tag matched with curly braces (and whitespaces at begin and end): { tag }
       [1] - found part from passed re
       [index] - position of tag starting { in s
    */
    function findTag(re,s)
    {
        var openCount = 0;
        var offset = 0;
        var skipInWS = jSmart.prototype.auto_literal;

        var reTag = new RegExp('^{ *('+re+') *}$','i');

        var WS = " \n\r\t";

        for (var i=0; i<s.length; ++i)
        {
            if (s.substr(i,1) == jSmart.prototype.ldelim)
            {
                if (skipInWS && i+1 < s.length && WS.indexOf(s[i+1]) >= 0)
                {
                    continue;
                }
                if (!openCount)
                {
                    s = s.slice(i);
                    offset += i;
                    i = 0;
                }
                ++openCount;
            }
            else if (s.substr(i,1) == jSmart.prototype.rdelim)
            {
                if (skipInWS && i-1 >= 0 && WS.indexOf(s[i-1]) >= 0)
                {
                    continue;
                }
                if (!--openCount)
                {
                    var sTag = s.slice(0,i+1).replace(/[\r\n]/g, ' ');
                    var found = sTag.match(reTag);
                    if (found)
                    {
                        found.index = offset;
                        return found;
                    }
                }
                if (openCount < 0) //ignore unmatched }
                {
                    openCount = 0;
                }
            }
        }
        return null;
    }

    function findCloseTag(reClose,reOpen,s)
    {
        var sInner = '';
        var closeTag = null;
        var openTag = null;
        var findIndex = 0;

        do 
        {
            if (closeTag)
            {
                findIndex += closeTag[0].length;
            }
            closeTag = findTag(reClose,s);
            if (!closeTag)
            {
                throw new Error('Unclosed {'+reOpen+'}');
            }
            sInner += s.slice(0,closeTag.index);
            findIndex += closeTag.index;
            s = s.slice(closeTag.index+closeTag[0].length);
            
            openTag = findTag(reOpen,sInner);
            if (openTag)
            {
                sInner = sInner.slice(openTag.index+openTag[0].length);
            }
        }
        while (openTag);

        closeTag.index = findIndex;
        return closeTag;
    }

    function findElseTag(reOpen, reClose, reElse, s)
    {
        var offset = 0;
        for (var elseTag=findTag(reElse,s); elseTag; elseTag=findTag(reElse,s))
        {
            var openTag = findTag(reOpen,s);
            if (!openTag || openTag.index > elseTag.index)
            {
                elseTag.index += offset;
                return elseTag;
            }
            else
            {
                s = s.slice(openTag.index+openTag[0].length);
                offset += openTag.index+openTag[0].length;
                var closeTag = findCloseTag(reClose,reOpen,s);
                s = s.slice(closeTag.index + closeTag[0].length);
                offset += closeTag.index + closeTag[0].length;
            }
        }
        return null;
    }

    function prepareVar(code)
    {
        return code.replace(/([$]\w+)@(index|iteration|first|last|show|total)/gi, "$1__$2");
    }

    function execute(code, data)
    {
        if (typeof(code) == 'string')
        {
            with (modifiers)
            {
                with (data)
                {
                    try {
                        return eval(code);
                    }
                    catch(e)
                    {
                        throw new Error(e.message + ' in \n' + code);
                    }
                }
            }
        }
        return code;
    }

    function assignVar(nm, val, data)
    {
        with ( {__data:data, __v: val} )
        { 
            if (nm.match(/\[\]$/))  //push to array
            {
                nm = nm.replace(/\[\]$/,'');
                eval('__data.'+nm+'.push(__v)'); 
            }
            else
            {
                eval('__data.'+nm+'=__v'); 
            }
        }
    }

    var buildInFunctions = 
        {
            __quoted:
            {
                process: function(node, data)
                {
                    return getActualParamValues(node.params, data).join('');
                }
            },

            __operator:
            {
                process: function(node, data)
                {
                    var params = getActualParamValues(node.params, data);

                    data.__arg1 = params[0];

                    if (node.optype == 'binary')
                    {
                        data.__arg2 = params[1];
                        if (node.op == '=')
                        {
                            var varName = node.params.__parsed[0].name;
                            assignVar(varName, params[1], data);
                            return '';
                        }
                        else if (node.op.match(/(\+=|-=|\*=|\/=|%=)/))
                        {
                            var varName = node.params.__parsed[0].name;
                            return execute(varName+node.op+'__arg2', data);
                        }
                        else if (node.op.match(/div/))
                        {
                            return execute('__arg1 % __arg2'+(node.op=='div'?'==':'!=')+'0', data);
                        }
                        else if (node.op.match(/even/))
                        {
                            return execute('(__arg1 / __arg2) % 2'+(node.op=='even'?'==':'!=')+'0', data);
                        }

                        return execute('__arg1 '+node.op+'__arg2', data);
                    }
                    else if (node.op == '!')
                    {
                        return execute('!__arg1', data);
                    }
                    else 
                    {
                        var varName = node.params.__parsed[0].type=='var' ? node.params.__parsed[0].name : params[0];
                        if (node.optype == 'pre-unary')
                        {
                            return execute(node.op+varName, data);
                        }
                        else
                        {
                            return execute(varName+node.op, data);  //?
                        }
                    }
                }
            },

            section: 
            {
                type: 'block',
                parse: function(paramStr, tree, content)
                {
                    var subTree = [];
                    var subTreeElse = [];
                    tree.push({
                        type: 'build-in',
                        name: 'section',
                        params: parseParams(paramStr),
                        subTree: subTree,
                        subTreeElse: subTreeElse
                    });

                    var findElse = findElseTag('section [^}]+', '\/section', 'sectionelse', content);
                    if (findElse)
                    {
                        parse(content.slice(0,findElse.index),subTree);
                        parse(content.slice(findElse.index+findElse[0].length).replace(/^[\r\n]/,''), subTreeElse);
                    }
                    else
                    {
                        parse(content, subTree);
                    }            
                },

                process: function(node, data)
                {
                    var params = getActualParamValues(node.params, data);
                    params.loop = execute(node.params.loop, data);

                    var sectionProps = {};
                    data.$smarty.section[params.name] = sectionProps;

                    var show = params.__get('show',true);
                    sectionProps.show = show;
                    if (!show)
                    {
                        return process(node.subTreeElse, data);
                    }

                    var s = '';
                    if (params.loop instanceof Object)
                    {
                        if( this.foreach(
                            params.name, 
                            params.__get('start',0),
                            (params.loop instanceof Array) ? params.loop.length : countProperties(params.loop),
                            params.__get('step',1),
                            params.__get('max'),
                            data,
                            sectionProps,
                            function(i) { 
                                eval(params.name + ' = ' + i + ';'); 
                                s += process(node.subTree, data);  
                            }
                        ))
                        {
                            return s;
                        }
                    }
                    else if (parseInt(params.loop))
                    {
                        if( this.foreach(
                            params.name, 
                            params.__get('start',0),
                            parseInt(params.loop),
                            params.__get('step',1),
                            params.__get('max'),
                            data,
                            sectionProps,
                            function(i) { s += process(node.subTree, data);  }
                        ))
                        {
                            return s;
                        }
                    }
                    return process(node.subTreeElse, data);
                },

                foreach: function(nm, from, to, step, max, data, props, callback)
                {
                    from = parseInt(from);
                    to = parseInt(to);
                    step = parseInt(step);
                    max = parseInt(max);
                    if (isNaN(max))
                    {
                        max = Number.MAX_VALUE;
                    }

                    if (from < 0)
                    {
                        from = to + from;
                        if (from < 0)
                        {
                            from = 0;
                        }
                    }
                    else if (from >= to)
                    {
                        from = to ? to-1 : 0;
                    }

                    var count = 0;
                    var loop = 0;
                    var i = from;
                    for (; i>=0 && i<to && count<max; i+=step,++count) 
                    {
                        loop = i;
                    }
                    props.total = count;
                    props.loop = count;  //? - because it is so in Smarty

                    count = 0;
                    for (i=from; i>=0 && i<to && count<max; i+=step,++count)
                    {
                        props.first = (i==from);
                        props.last = ((i+step)<0 || (i+step)>=to);
                        props.index = i;
                        props.index_prev = i-step;
                        props.index_next = i+step;
                        props.iteration = props.rownum = count+1;

                        callback(i);
                    }
                    return count;
                }
            },

            'for':
            {
                type: 'block',
                parse: function(paramStr, tree, content)
                {
                    var res = paramStr.match(/^\s*\$(\w+)\s*=\s*([^\s]+)\s*to\s*([^\s]+)\s*(?:step\s*([^\s]+))?\s*(.*)$/);
                    if (!res)
                    {
                        throw new Error('Invalid {for} parameters: '+paramStr);
                    }
                    
                    var subTree = [];
                    var subTreeElse = [];
                    tree.push({
                        type: 'build-in',
                        name: 'for',
                        params: parseParams("varName='"+res[1]+"' from="+res[2]+" to="+res[3]+" step="+(res[4]?res[4]:'1')+" "+res[5]),
                        subTree: subTree,
                        subTreeElse: subTreeElse
                    });

                    var findElse = findElseTag('for\\s[^}]+', '\/for', 'forelse', content);
                    if (findElse)
                    {
                        parse(content.slice(0,findElse.index),subTree);
                        parse(content.slice(findElse.index+findElse[0].length), subTreeElse);
                    }
                    else
                    {
                        parse(content, subTree);
                    }            
                },

                process: function(node, data)
                {
                    var params = getActualParamValues(node.params, data);
                    var from = parseInt(params.__get('from'));
                    var to = parseInt(params.__get('to'));
                    var step = parseInt(params.__get('step'));
                    if (isNaN(step))
                    {
                        step = 1;
                    }
                    var max = parseInt(params.__get('max'));
                    if (isNaN(max))
                    {
                        max = Number.MAX_VALUE;
                    }

                    var count = 0;
                    var s = '';
			           var total = Math.min( Math.ceil( ((step > 0 ? to-from : from-to)+1) / Math.abs(step)  ), max);
			           
                    for (var i=parseInt(params.from); count<total; i+=step,++count)
                    {
                        data['$'+params.varName] = i;
                        s += process(node.subTree, data);
                    }
                    if (!count)
                    {
                        s = process(node.subTreeElse, data);
                    }
                    return s;
                }
            },

            'if': 
            {
                type: 'block',
                parse: function(paramStr, tree, content)
                {
                    var subTreeIf = [];
                    var subTreeElse = [];
                    tree.push({
                        type: 'build-in',
                        name: 'if',
                        params: parseParams(paramStr),
                        subTreeIf: subTreeIf,
                        subTreeElse: subTreeElse
                    });

                    var findElse = findElseTag('if\\s+[^}]+', '\/if', 'else[^}]*', content);
                    if (findElse)
                    {
                        parse(content.slice(0,findElse.index),subTreeIf);

                        content = content.slice(findElse.index+findElse[0].length);
                        var findElseIf = findElse[1].match(/^elseif(.*)/);
                        if (findElseIf)
                        {
                            buildInFunctions['if'].parse(findElseIf[1], subTreeElse, content.replace(/^\n/,''));
                        }
                        else
                        {
                            parse(content.replace(/^\n/,''), subTreeElse);
                        }
                    }
                    else
                    {
                        parse(content, subTreeIf);
                    }
                },

                process: function(node, data)
                {
                    if (getActualParamValues(node.params,data)[0])
                    {
                        return process(node.subTreeIf, data);
                    }
                    else
                    {
                        return process(node.subTreeElse, data);
                    }
                }
            },

            foreach: 
            {
                type: 'block',
                parse: function(paramStr, tree, content)
                {
                    var arrName = null;
                    var varName = null;
                    var keyName = null;
                    var loopName = null;

                    var res = paramStr.match(/^\s*[$](\w+)\s*as\s*[$](\w+)\s*(=>\s*[$](\w+))?\s*$/i);
                    if (res)
                    {
                        arrName = '$'+res[1];
                        varName = res[4] ? res[4] : res[2];
                        keyName = res[4] ? res[2] : null;
                    }
                    else    //Smarty 2.x syntax
                    {
                        var params = parseParams(paramStr);
                        arrName = params['from'];
                        varName = trimQuotes(params['item']);
                        if ('key' in params)
                        {
                            keyName = trimQuotes(params['key']);
                        }
                        if ('name' in params)
                        {
                            loopName = trimQuotes(params['name']);
                        }
                    }

                    var subTree = [];
                    var subTreeElse = [];
                    tree.push({
                        type: 'build-in',
                        name: 'foreach',
                        arr: arrName,
                        keyName: keyName,
                        varName: '$'+varName,
                        loopName: loopName,
                        subTree: subTree,
                        subTreeElse: subTreeElse
                    });

                    var findElse = findElseTag('foreach\\s[^}]+', '\/foreach', 'foreachelse', content);
                    if (findElse)
                    {
                        parse(content.slice(0,findElse.index),subTree);
                        parse(content.slice(findElse.index+findElse[0].length).replace(/^[\r\n]/,''), subTreeElse);
                    }
                    else
                    {
                        parse(content, subTree);
                    }
                },

                process: function(node, data)
                {
                    var a = (node.arr in data) ? data[node.arr] : trimQuotes(node.arr);
                    if (!(a instanceof Object))
                    {
                        a = [a];
                    }

                    var total = (a instanceof Array) ? a.length : countProperties(a);

                    data[node.varName+'__total'] = total;
                    if (node.loopName)
                    {
                        data.$smarty.foreach[node.loopName] = {};
                        data.$smarty.foreach[node.loopName]['total'] = total;
                    }

                    var s='';
                    var i=0;
                    for (var key in a)
                    {
                        if (a instanceof Array)
                        {
                            key = parseInt(key);
                            if (isNaN(key))
                            {
                                continue;
                            }
                        }

                        data[node.varName+'__key'] = key;
                        if (node.keyName)
                        {
                            data['$'+node.keyName] = data[node.varName+'__key'];
                        }
                        data[node.varName] = a[key];
                        data[node.varName+'__index'] = parseInt(i);
                        data[node.varName+'__iteration'] = parseInt(i+1);
                        data[node.varName+'__first'] = (i===0);
                        data[node.varName+'__last'] = (i==total-1);
                        
                        if (node.loopName)
                        {
                            data.$smarty.foreach[node.loopName].index = parseInt(i);
                            data.$smarty.foreach[node.loopName].iteration = parseInt(i+1);
                            data.$smarty.foreach[node.loopName].first = (i===0) ? 1 : '';
                            data.$smarty.foreach[node.loopName].last = (i==total-1) ? 1 : '';
                        }

                        s += process(node.subTree, data);
                        ++i;
                    }
                    data[node.varName+'__show'] = (i>0);
                    if (node.loopName)
                    {
                        data.$smarty.foreach[node.loopName].show = (i>0) ? 1 : '';
                    }
                    if (i>0)
                    {
                        return s;                
                    }
                    return process(node.subTreeElse, data);
                }
            },

            'function': 
            {
                type: 'block',
                parse: function(paramStr, tree, content)
                {
                    var params = parseParams(paramStr);
                    var subTree = [];
                    plugins[trimQuotes(params.name?params.name:params[0])] = 
                        {
                            type: 'function',
                            subTree: subTree,
                            defautParams: params,
                            process: function(params, data)
                            {
                                var defaults = getActualParamValues(this.defautParams,data);
                                delete defaults.name;
                                return process(this.subTree, obMerge('$',obMerge('',{},data),defaults,params));
                            }
                        };
                    parse(content.replace(/\n+$/,''), subTree);
                }
            },

            php:
            {
                type: 'block',
                parse: function(paramStr, tree, content) {}
            },

            'extends':
            {
                type: 'function',
                parse: function(paramStr, tree)
                {
                    var params = parseParams(paramStr);
                    var file = trimQuotes(params.file?params.file:params[0]);
                    var tpl = jSmart.prototype.getTemplate(file);
                    if (typeof(tpl) != 'string')
                    {
                        throw new Error('No template for '+ file);
                    }
                    parse(stripComments(tpl.replace(/\r\n/g,'\n')), tree);
                }
            },

            block:
            {
                type: 'block',
                parse: function(paramStr, tree, content)
                {
                    var params = parseParams(paramStr);

                    tree.push({
                        type: 'build-in',
                        name: 'block',
                        params: params
                    });
                    
                    if (!('append' in params))
                    {
                        params.append = false;
                    }
                    if (!('prepend' in params))
                    {
                        params.prepend = false;
                    }
                    params.hasChild = params.hasParent = false;

                    var __parseVar = parseVar;
                    parseVar = function(name, tree)
                    {
                        if (name.match(/^\s*[$]smarty.block.child\s*$/))
                        {
                            params.hasChild = true;
                        }
                        if (name.match(/^\s*[$]smarty.block.parent\s*$/))
                        {
                            params.hasParent = true;
                        }
                        tree.push({type:'var', name:prepareVar(name)});
                        return tree;
                    };

                    var tree = [];
                    parse(content, tree);

                    parseVar = __parseVar;

                    var blockName = trimQuotes(params.name?params.name:params[0]);
                    if (!(blockName in blocks))
                    {
                        blocks[blockName] = [];
                    }
                    blocks[blockName].push({tree:tree, params:params});
                },

                process: function(node, data)
                {
                    data.$smarty.block.parent = data.$smarty.block.child = '';
                    var blockName = trimQuotes(node.params.name?node.params.name:node.params[0]);
                    this.processBlocks(blocks[blockName], blocks[blockName].length-1, data);
                    return data.$smarty.block.child;
                },

                processBlocks: function(blockAncestry, headIdx, data)
                {
                    var append = true; //(headIdx == blockAncestry.length-1);
                    var prepend = false;
                    var i = headIdx;
                    for (; i>=0; --i)
                    {
                        if (blockAncestry[i].params.hasParent)
                        {
                            var tmpChild = data.$smarty.block.child;
                            data.$smarty.block.child = '';
                            this.processBlocks(blockAncestry, i-1, data);
                            data.$smarty.block.parent = data.$smarty.block.child;
                            data.$smarty.block.child = tmpChild;
                        }

                        var tmpChild = data.$smarty.block.child;
                        var s = process(blockAncestry[i].tree, data);
                        data.$smarty.block.child = tmpChild;

                        if (blockAncestry[i].params.hasChild)
                        {
                            data.$smarty.block.child = s;
                        }
                        else if (append)
                        {
                            data.$smarty.block.child = s + data.$smarty.block.child;
                        }
                        else if (prepend)
                        {
                            data.$smarty.block.child += s;
                        }
                        append = blockAncestry[i].params.append;
                        prepend = blockAncestry[i].params.prepend;
                    }
                }
            },

            strip:
            {
                type: 'block',
                parse: function(paramStr, tree, content)
                {
                    parse(content.replace(/[ \t]*[\r\n]+[ \t]*/g, ''), tree);
                }
            },

            literal:
            {
                type: 'block',
                parse: function(paramStr, tree, content)
                {
                    parseText(content, tree);
                }
            },

            ldelim:
            {
                type: 'function',
                parse: function(paramStr, tree)
                {
                    parseText(jSmart.prototype.ldelim, tree);
                }
            },

            rdelim:
            {
                type: 'function',
                parse: function(paramStr, tree)
                {
                    parseText(jSmart.prototype.rdelim, tree);
                }
            }
        };

    var plugins = {};
    var modifiers = {};
    var files = {};
    var blocks = null;

    function parse(s, tree)
    {
        var reTag = '.+';
        for (var openTag=findTag(reTag,s); openTag; openTag=findTag(reTag,s))
        {
            if (openTag.index)
            {
                parseText(s.slice(0,openTag.index),tree);
            }
            s = s.slice(openTag.index + openTag[0].length);

            var res = openTag[1].match(/^\s*(\w+)(.*)$/);
            if (res)         //function
            {
                var nm = res[1];
                var params = (res.length>2) ? res[2] : '';

                if (nm in buildInFunctions)
                {
                    if (buildInFunctions[nm].type == 'block')
                    {
					         s = s.replace(/^\n/,'');  	//remove new line after block open tag (like in Smarty)
                        var closeTag = findCloseTag('\/'+nm, nm+' +[^}]*', s);
                        buildInFunctions[nm].parse(params, tree, s.slice(0,closeTag.index));
                        s = s.slice(closeTag.index+closeTag[0].length);
                    }
                    else
                    {
                        buildInFunctions[nm].parse(params, tree);
                        if (nm == 'extends')
                        {
                            tree = []; //throw away further parsing except for {block}
                        }
                    }
                    s = s.replace(/^\n/,'');
                }
                else if (nm in plugins)
                {
                    var plugin = plugins[nm];
                    if (plugin.type == 'block')
                    {
                        var closeTag = findCloseTag('\/'+nm, nm+' +[^}]*', s);
                        parsePluginBlock(nm, parseParams(params), tree, s.slice(0,closeTag.index));
                        s = s.slice(closeTag.index+closeTag[0].length);
                    }
                    else if (plugin.type == 'function')
                    {
                        parsePluginFunc(nm, params, tree);
                    }
                    if (nm=='append' || nm=='assign' || nm=='capture' || nm=='eval' || nm=='include' || nm=='while' || nm=='nocache')
                    {
                        s = s.replace(/^\n/,'');
                    }
                }
                else   //variable
                {
                    tree.push( parseExpression(openTag[1]).tree );
                }
            }
            else         //variable
            {
                tree.push( parseExpression(openTag[1]).tree );
                if (tree[tree.length-1].name=='__operator' && tree[tree.length-1].op == '=')
                {
                    s = s.replace(/^\n/,'');
                }
            }
        }
        if (s) 
        {
            parseText(s, tree);
        }
        return tree;
    }

    function parseText(text, tree)
    {
        if (parseText.parseEmbeddedVars)
        {
            var re = /([$][\w@]+)|`([$][\w@]+(?:[.]\w+|\[(?:"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')?\])*)`/;
            for (var found=text.match(re); found; found=text.match(re))
            {
                tree.push({type: 'text', data: text.slice(0,found.index)});
                parseVar(found[1]?found[1]:found[2], tree);
                text = text.slice(found.index + found[0].length);
            }
        }
        tree.push({type: 'text', data: text});
        return tree;
    }

    function parseVar(name, tree)
    {
        tree.push({
            type: 'var',
            name: prepareVar(name)
        });
        return tree;
    }

    function parseFunc(name, params, tree)
    {
        params.__parsed.name = parseText(name,[])[0];
        tree.push({
            type: 'plugin',
            name: '__func',
            params: params
        });
        return tree;
    }

    function parseOperator(op, type, precedence, tree)
    {
        tree.push({
            type: 'build-in',
            name: '__operator',
            op: op,
            optype: type,
            precedence: precedence,
            params: {}
        });
    }


    var tokens = 
        [
            {
                re: /[$][\w@]+(?:[.]\w+|\[(?:"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|\d+|[$][\w@]+|\w+)?\])*/,  //var
                parse: function(e, s)
                {
                    parseVar(e.token, e.tree);
                    parseModifiers(s, e);
                }
            },
            {
                re: /(true|false)/,  //bool
                parse: function(e, s)
                {
                    parseText(e.token.match(/true/i) ? '1' : '', e.tree);
                }
            },
            {
                re: /'[^'\\]*(?:\\.[^'\\]*)*'/, //single quotes
                parse: function(e, s)
                {
                    parseText(eval(e.token), e.tree);
                    parseModifiers(s, e);
                }
            },
            {
                re: /"[^"\\]*(?:\\.[^"\\]*)*"/,  //double quotes
                parse: function(e, s)
                {
                    var v = eval(e.token);
                    var isVar = v.match(tokens[0].re);
                    if (isVar && isVar[0].length == v.length)
                    {
                        parseVar(v, e.tree);
                    }
                    else
                    {
                        var tree = [];
                        parseText.parseEmbeddedVars = true;
                        parse(v, tree);
                        parseText.parseEmbeddedVars = false;
                        if (tree.length == 1)
                        {
                            e.tree.push(tree[0]);
                        }
                        else
                        {
                            e.tree.push({
                                type: 'build-in',
                                name: '__quoted',
                                params: {__parsed:tree}
                            });
                        }
                    }
                    parseModifiers(s, e);
                }
            },
            {
                re: /(\w+)\s*[(]/,  //func()
                parse: function(e, s)
                {
                    var fnm = RegExp.$1;
                    var params = parseParams(s,'\\s*,\\s*');
                    parseFunc(fnm, params, e.tree);
                    e.value += params.str;
                    parseModifiers(s.slice(params.str.length), e);
                }
            },
            {
                re: /\s*\(\s*/,
                parse: function(e, s)
                {
                    var parens = [];
                    e.tree.push(parens);
                    parens.parent = e.tree;
                    e.tree = parens;
                }
            },
            {
                re: /\s*\)\s*/,
                parse: function(e, s)
                {
                    if (e.tree.parent) //it may be the end of func() or (expr)
                    {
                        e.tree = e.tree.parent;
                    }
                }
            },
            {
                re: /\s*(\+\+|--)\s*/,
                parse: function(e, s)
                {
                    if (e.tree.length && e.tree[e.tree.length-1].type == 'var')
                    {
                        parseOperator(RegExp.$1, 'post-unary', 1, e.tree);
                    }
                    else
                    {
                        parseOperator(RegExp.$1, 'pre-unary', 1, e.tree);
                    }
                }
            },
            {
                re: /\s*(==|!=|===|!==)\s*/,
                parse: function(e, s)
                {
                    parseOperator(RegExp.$1, 'binary', 6, e.tree);
                }
            },
            {
                re: /\s+(eq|ne|neq)\s+/,
                parse: function(e, s)
                {
                    var op = RegExp.$1.replace(/ne(q)?/,'!=').replace(/eq/,'==');
                    parseOperator(op, 'binary', 6, e.tree);
                }
            },
            {
                re: /\s*!\s*/,
                parse: function(e, s)
                {
                    parseOperator('!', 'pre-unary', 2, e.tree);
                }
            },
            {
                re: /\s+not\s+/,
                parse: function(e, s)
                {
                    parseOperator('!', 'pre-unary', 2, e.tree);
                }
            },
            {
                re: /\s*(=|\+=|-=|\*=|\/=|%=)\s*/,
                parse: function(e, s)
                {
                    parseOperator(RegExp.$1, 'binary', 10, e.tree);
                }
            },
            {
                re: /\s*(\*|\/|%)\s*/,
                parse: function(e, s)
                {
                    parseOperator(RegExp.$1, 'binary', 3, e.tree);
                }
            },
            {
                re: /\s+mod\s+/,
                parse: function(e, s)
                {
                    parseOperator('%', 'binary', 3, e.tree);
                }
            },
            {
                re: /\s*(\+|-)\s*/,
                parse: function(e, s)
                {
                    if (!e.tree.length || e.tree[e.tree.length-1].name == '__operator')
                    {
                        parseOperator(RegExp.$1, 'pre-unary', 4, e.tree);
                    }
                    else
                    {
                        parseOperator(RegExp.$1, 'binary', 4, e.tree);
                    }
                }
            },
            {
                re: /\s*(<|<=|>|>=|<>)\s*/,
                parse: function(e, s)
                {
                    parseOperator(RegExp.$1.replace(/<>/,'!='), 'binary', 5, e.tree);
                }
            },
            {
                re: /\s+(lt|lte|le|gt|gte|ge)\s+/,
                parse: function(e, s)
                {
                    var op = RegExp.$1.replace(/lt/,'<').replace(/l(t)?e/,'<=').replace(/gt/,'>').replace(/g(t)?e/,'>=');
                    parseOperator(op, 'binary', 5, e.tree);
                }
            },
            {
                re: /\s+(is\s+(not\s+)?div\s+by)\s+/,
                parse: function(e, s)
                {
                    parseOperator(RegExp.$2?'div_not':'div', 'binary', 7, e.tree);
                }
            },
            {
                re: /\s+is\s+(not\s+)?(even|odd)(\s+by\s+)?\s*/,
                parse: function(e, s)
                {
                    var op = RegExp.$1 ? ((RegExp.$2=='odd')?'even':'even_not') : ((RegExp.$2=='odd')?'even_not':'even');
                    parseOperator(op, 'binary', 7, e.tree);
                    if (!RegExp.$3)
                    {
                        parseText('1', e.tree);
                    }
                }
            },
            {
                re: /\s*(&&)\s*/,
                parse: function(e, s)
                {
                    parseOperator(RegExp.$1, 'binary', 8, e.tree);
                }
            },
            {
                re: /\s*(\|\|)\s*/,
                parse: function(e, s)
                {
                    parseOperator(RegExp.$1, 'binary', 9, e.tree);
                }
            },
            {
                re: /\s+and\s+/,
                parse: function(e, s)
                {
                    parseOperator('&&', 'binary', 11, e.tree);
                }
            },
            {
                re: /\s+xor\s+/,            //TODO
                parse: function(e, s)
                {
                    parseOperator(RegExp.$1, 'binary', 12, e.tree);
                }
            },
            {
                re: /\s+or\s+/,
                parse: function(e, s)
                {
                    parseOperator('||', 'binary', 13, e.tree);
                }
            },
            {
                re: /[\w.]+/, //static
                parse: function(e, s)
                {
                    parseText(e.token, e.tree);
                    parseModifiers(s, e);
                }
            }
        ];

    function parseModifiers(s, e)
    {
        if (parseModifiers.stop) {
            return false;
        }

        if (s.match(/^[|](\w+)(?:\s*(:)\s*)?/) && (RegExp.$1 in modifiers || RegExp.$1 == 'default' || eval('typeof '+RegExp.$1) == 'function'))
        {
            e.value += RegExp.lastMatch;

            var fnm = RegExp.$1;
            if (fnm == 'default')
            {
                fnm = 'defaultValue';
            }
            s = s.slice(RegExp.lastMatch.length).replace(/^\s+/,'');

            parseModifiers.stop = true;
            var params = parseParams(RegExp.$2?s:'', '\\s*:\\s*');
            parseModifiers.stop = false;

            e.value += params.str;

            params.unshift(e.token);
            params.__parsed.unshift(e.tree.pop());  //modifier has the highest precedence over all the operators
            e.tree.push(parseFunc(fnm,params,[])[0]);

            s = s.slice(params.str.length);

            parseModifiers(s, e);
            return true;
        }
        return false;
    }

    function lookUp(s,e)
    {
        if (!s)
        {
            return false;
        }

        if (parseModifiers.stop && e.tree.length)
        {
            return false;
        }

        if (s.match('^'+jSmart.prototype.ldelim))
        {
            var tag = findTag('.*',s);
            if (tag)
            {
                e.value += tag[0];
                parse(tag[0], e.tree);
                parseModifiers(s.slice(e.value.length), e);
                return true;
            }
        }

        for (var i=0; i<tokens.length; ++i)
        {
            if (s.match(new RegExp('^'+tokens[i].re.source,'i')))
            {
                e.token = RegExp.lastMatch;
                e.value += RegExp.lastMatch;
                tokens[i].parse(e, s.slice(e.token.length));
                return true;
            }
        }
        return false;
    }

    function bundleOp(i, tree, precedence)
    {
        var op = tree[i];
        if (op.name == '__operator' && op.precedence == precedence && !op.params.__parsed)
        {
            if (op.optype == 'binary')
            {
                op.params.__parsed = [tree[i-1],tree[i+1]];
                tree.splice(i-1,3,op);
                return true;
            } 
            else if (op.optype == 'post-unary')
            {
                op.params.__parsed = [tree[i-1]];
                tree.splice(i-1,2,op);
                return true;
            }

            op.params.__parsed = [tree[i+1]];
            tree.splice(i,2,op);
        }
        return false;
    }

    function composeExpression(tree)
    {
        var i = 0;
        for (i=0; i<tree.length; ++i)
        {
            if (tree[i] instanceof Array)
            {
                tree[i] = composeExpression(tree[i])
            }
        }
        
        for (var precedence=1; precedence<14; ++precedence)
        {
            if (precedence==2 || precedence==10)
            {
                for (i=tree.length; i>0; --i)
                {
                    i -= bundleOp(i-1, tree, precedence);
                }
            }
            else
            {
                for (i=0; i<tree.length; ++i)
                {
                    i -= bundleOp(i, tree, precedence);
                }
            }
        }
        return tree[0]; //only one node must be left
    }

    function parseExpression(s)
    {
        var e = { value:'', tree:[] };
        while (lookUp(s.slice(e.value.length), e)){}
        if (!e.tree.length)
        {
            return false;
        }
        e.tree = composeExpression(e.tree);
        return e;
    }

    function parseParams(paramsStr, delim)
	 {
		  var s = paramsStr.replace(/\n/g,' ').replace(/^\s+|\s+$/g,'');
		  var params = [];
        params.__parsed = [];
        params.str = '';

        if (!s)
        {
            return params;
        }

        var named = false;
        if (!delim)
        {
            delim = /^\s+/;
            named = true;
        }
        else
        {
            delim = new RegExp('^'+delim);
        }

        while (s)
        {
            var nm = null;
            if (named && s.match(/^(\w+)\s*=\s*/))
            {
                nm = RegExp.$1;
                params.str += s.slice(0,RegExp.lastMatch.lengt);
                s = s.slice(RegExp.lastMatch.length);
            }

            var param = parseExpression(s);
            if (!param)
            {
                break;
            }
            
		      if (nm)
		      {
				    params[nm] = param.value;
                params.__parsed[nm] = param.tree; 
		      }
		      else
		      {
				    params.push(param.value);
                params.__parsed.push(param.tree);

                if (isNaN(param.value))
                {
                    params[param.value] = true;
                    params.__parsed[param.value] = parseText('1',[]);
                }
		      }

            params.str += s.slice(0,param.value.length);
            s = s.slice(param.value.length);

            if (s.match(delim))
            {
                params.str += s.slice(0,RegExp.lastMatch.length);
                s = s.slice(RegExp.lastMatch.length);
            }
            else
            {
                break;
            }
        }
		  return params;
	 }

    function parsePluginBlock(name, params, tree, content)
    {
        tree.push({
            type: 'plugin',
            name: name,
            params: params,
            subTree: parse(content,[])
        });
    }

    function parsePluginFunc(name, params, tree)
    {
        tree.push({
            type: 'plugin',
            name: name,
            params: parseParams(params)
        });
    }

    function getActualParamValues(params,data)
    {
        var actualParams = [];
        for (var nm in params.__parsed)
        {
            if (params.__parsed.hasOwnProperty(nm))
            {
                var node = params.__parsed[nm];
                var v = '';

                if (node.type == 'var' && isValidVar(node.name, data))
                {
                    with (data)
                    {
                        v = eval(node.name);
                    }
                }
                else
                {
                    v = process([node], data);
                }

                if (typeof(v) == 'string' && v.match(/^[1-9]\d*$/) && !isNaN(v))
                {
                    v = parseInt(v);
                }
                actualParams[nm] = v;
            }
        }

        actualParams.__get = function(nm,defVal,id)
        {
            if (nm in actualParams && typeof(actualParams[nm]) != 'undefined')
            {
                return actualParams[nm];
            }
            if (typeof(id)!='undefined' && typeof(actualParams[id]) != 'undefined')
            {
                return actualParams[id];
            }
            if (defVal === null)
            {
                throw new Error("The required attribute '"+nm+"' is missing");
            }
            return defVal;
        };
        return actualParams;
    }

    function isValidVar(varName, data)
    {
		  if (!varName.match(/^\s*[$]/))
		  {
			   return false;
		  }
        try
	     {
		      with (data)
		      {
			       eval(varName);
		      }
	     }
	     catch(e)
	     {
		      return false;
	     }
	     return true;
    }

    function process(tree, data)
    {
        var res = '';
        for (var i=0; i<tree.length; ++i)
        {
            var s = '';
            var node = tree[i];
            if (node.type == 'text')
            {
                s = node.data;
            }
            else if (node.type == 'var')
            {
                try {
                    s = execute(node.name, data);
                }
                catch(e)
                {
                    s = '';
                }
            }
            else if (node.type == 'build-in')
            {
                s = buildInFunctions[node.name].process(node,data);
            }
            else if (node.type == 'plugin')
            {
                var plugin = plugins[node.name];
                if (plugin.type == 'block')
                {
                    var repeat = {value:true};
                    plugins[node.name].process(getActualParamValues(node.params,data), '', data, repeat);
                    while (repeat.value)
                    {
                        repeat.value = false;
                        s += plugins[node.name].process(
                            getActualParamValues(node.params,data), 
                            process(node.subTree, data), 
                            data, 
                            repeat
                        );
                    }
                }
                else if (plugin.type == 'function')
                {
                    s = plugins[node.name].process(getActualParamValues(node.params,data), data);
                }
            }
            if (typeof s == 'boolean')
            {
                s = s ? '1' : '';
            }
            res += s;
        }
        return res;    
    }

    function stripComments(s)
    {
        var sRes = '';
        for (var openTag=s.match(/{\*/); openTag; openTag=s.match(/{\*/))
        {
            sRes += s.slice(0,openTag.index);
            s = s.slice(openTag.index+openTag[0].length);
            var closeTag = s.match(/\*}/);
            if (!closeTag)
            {
                throw new Error('Unclosed {*');
            }
            s = s.slice(closeTag.index+closeTag[0].length);
            if (sRes.match(/\n+$/) && s.match(/^\n+/))
            {
                sRes = sRes.replace(/\n+$/,'\n');
                s = s.replace(/^\n/,'')
            }
        }
        return sRes + s;
    }


    jSmart = function(tpl)
    {
        this.tree = [];
        this.blocks = {};
        blocks = this.blocks;
        parse(stripComments(tpl.replace(/\r\n/g,'\n')), this.tree);
    };

    jSmart.prototype.fetch = function(data)
    {
        var smarty = {
            smarty: 
            {
                block: {},
                capture: {},
                cycle: {},
                foreach: {},
                section: {},
                now: Math.floor( (new Date()).getTime()/1000 ),
                'const': {},
                config: {},
                current_dir: '/',
                template: '',
                ldelim: jSmart.prototype.ldelim,
                rdelim: jSmart.prototype.rdelim,
                version: '2.3'
            }
        };
        blocks = this.blocks;
        return process(this.tree, obMerge('$',{},data,smarty));
    };

    /**
       @param type  valid values are 'function', 'block' or 'modifier'
       @param callback  func(params,data)  or  block(params,content,data,repeat)
    */
    jSmart.prototype.registerPlugin = function(type, name, callback)
    {
        if (type == 'modifier')
        {
            modifiers[name] = callback;
        }
        else
        {
            plugins[name] = {'type': type, 'process': callback};
        }
    };

    /**
       override this function
       @param name  value of 'file' parameter in {include} and {extends}
       @return template text
    */
    jSmart.prototype.getTemplate = function(name)
    {
        throw new Error('No template for '+ name);
    }


    /**     
       whether to skip tags in open brace { followed by white space(s) and close brace } with white space(s) before
    */
    jSmart.prototype.auto_literal = true;

    jSmart.prototype.ldelim = '{';
    jSmart.prototype.rdelim = '}';



    jSmart.prototype.PHPJS = function(fnm, modifier)
    {
        if (eval('typeof '+fnm) == 'function')
        {
            return window;
        }
        else if (typeof(PHP_JS) == 'function')
        {
            return new PHP_JS();
        }
        throw new Error("Modifier '" + modifier + "' uses '" + fnm + "' implementation from php.js project. Find out more at http://phpjs.org");
    }

    jSmart.prototype.makeTimeStamp = function(s)
    {
        if (!s)
        {
            return Math.floor( (new Date()).getTime()/1000 );
        }
        if (isNaN(s))
        {
            var tm = jSmart.prototype.PHPJS('strtotime','date_format').strtotime(s);
            if (tm == -1 || tm === false) {
                return Math.floor( (new Date()).getTime()/1000 );
            }
            return tm;
        }
        s = new String(s);
        if (s.length == 14) //mysql timestamp format of YYYYMMDDHHMMSS
        {
            return Math.floor( (new Date(s.substr(0,4),s.substr(4,2)-1,s.substr(6,2),s.substr(8,2),s.substr(10,2)).getTime()/1000 ) );
        }
        return parseInt(s);
    }



    /**
       register custom functions
    */
    jSmart.prototype.registerPlugin(
        'function', 
        '__func', 
        function(params, data)
        {
            var p = [];
            for(var i=0; i<params.length; ++i)
            {
                p.push(params.name+'__p'+i);
                data[params.name+'__p'+i] = params[i];
            }
            return execute(params.name + '(' + p.join(',') + ')', data);
        }
    );

    jSmart.prototype.registerPlugin(
        'function', 
        'append', 
        function(params, data)
        {
            var varName = '$' + params.__get('var',null,0);
            if (!(varName in data) || !(data[varName] instanceof Array))
            {
                data[varName] = [];
            }
            var index = params.__get('index',false);
            var val = params.__get('value',null,1);
            if (index === false)
            {
                data[varName].push(val);
            }
            else
            {
                data[varName][index] = val;
            }
            return '';
        }
    );

    jSmart.prototype.registerPlugin(
        'function', 
        'assign', 
        function(params, data)
        {
            assignVar('$'+params.__get('var',null,0), params.__get('value',null,1), data);
            return '';
        }
    );

    jSmart.prototype.registerPlugin(
        'function', 
        'call', 
        function(params, data)
        {
            var fname = params.__get('name',null,0);
            delete params.name;
            var assignTo = params.__get('assign',false);
            delete params.assign;
            var s = plugins[fname].process(params, data);
            if (assignTo)
            {
                assignVar('$'+assignTo, s, data);
                return '';
            }
            return s;
        }
    );

    jSmart.prototype.registerPlugin(
        'block', 
        'capture', 
        function(params, content, data, repeat)
        {
            if (content)
            {
                content = content.replace(/^\n/,'');
                data.$smarty.capture[params.__get('name','default',0)] = content;

                if ('assign' in params)
                {
                    assignVar('$'+params.assign, content, data);
                }

                var append = params.__get('append',false);
                if (append)
                {
                    append = '$'+append;
				        if (append in data)
				        {
					         if (data[append] instanceof Array)
					         {
						          data[append].push(content);
					         }
				        }
				        else
				        {
					         data[append] = [content];
				        }
                }
            }
            return '';
        }
    );

    jSmart.prototype.registerPlugin(
        'function', 
        'counter', 
        function(params, data)
        {
            var name = '__counter@' + params.__get('name','default');
            if (name in data)
            {
                if ('start' in params)
                {
                    data[name].value = parseInt(params['start']);
                }
                else
                {
                    data[name].value = parseInt(data[name].value);
                    data[name].skip = parseInt(data[name].skip);
                    if ('down' == data[name].direction)
                    {
                        data[name].value -= data[name].skip;
                    }
                    else
                    {
                        data[name].value += data[name].skip;
                    }
                }
                data[name].skip = params.__get('skip',data[name].skip);
                data[name].direction = params.__get('direction',data[name].direction);
                data[name].assign = params.__get('assign',data[name].assign);
            }
            else
            {
                data[name] = {
                    value: parseInt(params.__get('start',1)),
                    skip: parseInt(params.__get('skip',1)),
                    direction: params.__get('direction','up'),
                    assign: params.__get('assign',false)
                };
            }

            if (data[name].assign)
            {
                data['$'+data[name].assign] = data[name].value;
                return '';
            }

            if (params.__get('print',true))
            {
                return data[name].value;
            }

            return '';
        }
    );

    jSmart.prototype.registerPlugin(
        'function', 
        'cycle', 
        function(params, data)
        {
            var name = params.__get('name','default');
            var reset = params.__get('reset',false);
            if (!(name in data.$smarty.cycle))
            {
                data.$smarty.cycle[name] = {arr: [''], delimiter: params.__get('delimiter',','), index: 0};
                reset = true;
            }

            if (params.__get('delimiter',false))
            {
                data.$smarty.cycle[name].delimiter = params.delimiter;
            }
            var values = params.__get('values',false);
            if (values)
            {
                var arr = [];
                if (values instanceof Object)
                {
                    for (nm in values)
                    {
                        arr.push(values[nm]);
                    }
                }
                else
                {
                    arr = values.split(data.$smarty.cycle[name].delimiter);
                }
                
                if (arr.length != data.$smarty.cycle[name].arr.length || arr[0] != data.$smarty.cycle[name].arr[0])
                {
                    data.$smarty.cycle[name].arr = arr;
                    data.$smarty.cycle[name].index = 0;
                    reset = true;
                }
            }

            if (params.__get('advance','true'))
            {
                data.$smarty.cycle[name].index += 1;
            }
            if (data.$smarty.cycle[name].index >= data.$smarty.cycle[name].arr.length || reset)
            {
                data.$smarty.cycle[name].index = 0;
            }

            if (params.__get('assign',false))
            {
                assignVar('$'+params.assign, data.$smarty.cycle[name].arr[ data.$smarty.cycle[name].index ], data);
                return '';
            }

            if (params.__get('print',true))
            {
                return data.$smarty.cycle[name].arr[ data.$smarty.cycle[name].index ];
            }

            return '';
        }
    );

    jSmart.prototype.registerPlugin(
        'function', 
        'eval', 
        function(params, data)
        {
            var tree = [];
            parse(params.__get('var','',0), tree);
            var s = process(tree, data);
            if ('assign' in params)
            {
                assignVar('$'+params.assign, s, data);
                return '';
            }
            return s;
        }
    );

    jSmart.prototype.registerPlugin(
        'function', 
        'include', 
        function(params, data)
        {
            var file = params.__get('file',null,0);
            if (!(file in files))
            {
                files[file] = [];
                var tpl = jSmart.prototype.getTemplate(file);
                if (typeof(tpl) != 'string')
                {
                    throw new Error('No template for '+ file);
                }
                parse(stripComments(tpl.replace(/\r\n/g,'\n')), files[file]);
            }
            var incData = obMerge('$',obMerge('',{},data),params);
            incData.$smarty.template = file;
            var s = process(files[file], incData);
            if ('assign' in params)
            {
                assignVar('$'+params.assign, s, data);
                return '';
            }
            return s;
        }
    );

    jSmart.prototype.registerPlugin(
        'block', 
        'javascript', 
        function(params, content, data, repeat)
        {
            execute(content, data);
            return '';
        }
    );

    jSmart.prototype.registerPlugin(
        'block', 
        'nocache', 
        function(params, content, data, repeat)
        {
            return content;
        }
    );

    jSmart.prototype.registerPlugin(
        'block', 
        'while', 
        function(params, content, data, repeat)
        {
            if (content)
            {
                repeat.value = Boolean(params[0]);
                return repeat.value ? content.replace(/^\n/,'') : '';
            }
        }
    );



    /**
       register modifiers
    */
    jSmart.prototype.registerPlugin(
        'modifier', 
        'capitalize', 
        function(s, withDigits)
        {
            var re = new RegExp(withDigits ? '[\\W\\d]+' : '\\W+');
            var found = null;
            var res = '';
            for (found=s.match(re); found; found=s.match(re))
            {
	             var word = s.slice(0,found.index);
                if (word.match(/\d/))
                {
                    res += word;
                }
                else
                {
	                 res += word.charAt(0).toUpperCase() + word.slice(1);
                }
                res += s.slice(found.index, found.index+found[0].length);
	             s = s.slice(found.index+found[0].length);
            }
            if (s.match(/\d/))
            {
                return res + s;
            }
            return res + s.charAt(0).toUpperCase() + s.slice(1);
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'cat', 
        function(s, value)
        {
            value = value ? value : '';
            return s + value;
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'count_characters', 
        function(s, includeWhitespaces)
        {
            return includeWhitespaces ? s.length : s.replace(/\s/g,'').length;
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'count_paragraphs', 
        function(s)
        {
            var found = s.match(/\n+/g);
            if (found)
            {
	             return found.length+1;
            }
            return 1;
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'count_sentences', 
        function(s)
        {
            var found = s.match(/[^\s]\.(?!\w)/g);
            if (found)
            {
	             return found.length;
            }
            return 0;
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'count_words', 
        function(s)
        {
            var found = s.match(/\w+/g);
            if (found)
            {
	             return found.length;
            }
            return 0;
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'date_format', 
        function(s, fmt, defaultDate)
        {
            return jSmart.prototype.PHPJS('strftime','date_format').strftime(fmt?fmt:'%b %e, %Y', jSmart.prototype.makeTimeStamp(s?s:defaultDate));
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'defaultValue',
        function(s, value)
        {
            return (s && s!='null' && s!='undefined') ? s : (value ? value : '');
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'escape', 
        function(s, esc_type, char_set)
        {
            esc_type = esc_type ? esc_type : 'html';
            char_set = char_set ? char_set : 'UTF-8';

            switch (esc_type) 
            {
            case 'html':
                return jSmart.prototype.PHPJS('htmlspecialchars','escape').htmlspecialchars(s, 3/*=ENT_QUOTES*/, char_set);
            case 'htmlall':
                return jSmart.prototype.PHPJS('htmlentities','escape').htmlentities(s, 3, char_set);
            case 'url':
                return jSmart.prototype.PHPJS('rawurlencode','escape').rawurlencode(s);
            case 'urlpathinfo':
                return jSmart.prototype.PHPJS('rawurlencode','escape').rawurlencode(s).replace(/%2F/g, '/');
            case 'quotes': 
                return s.replace(/([^\\])'/, "$1\\'");
            case 'hex':
                var res = '';
                for (var i=0; i<s.length; ++i) 
                {
                    res += '%' + jSmart.prototype.PHPJS('bin2hex','escape').bin2hex(s.substr(i,1));
                } 
                return res;
            case 'hexentity':
                var res = '';
                for (var i=0; i<s.length; ++i) {
                    res += '&#x' + jSmart.prototype.PHPJS('bin2hex','escape').bin2hex(s.substr(i,1)) + ';';
                } 
                return res;
            case 'decentity':
                var res = '';
                for (var i=0; i<s.length; ++i) {
                    res += '&#' + jSmart.prototype.PHPJS('ord','escape').ord(s.substr(i,1)) + ';';
                } 
                return res;
            case 'mail': 
                return s.replace(/@/g,' [AT] ').replace(/[.]/g,' [DOT] ');
            case 'nonstd': 
                var res = '';
                for (var i=0; i<s.length; ++i)
                {
                    var _ord = jSmart.prototype.PHPJS('ord','escape').ord(s.substr(i,1));
                    if (_ord >= 126) {
                        res += '&#' + _ord + ';';
                    } else {
                        res += s.substr(i, 1);
                    } 
                    
                }
                return res;
            case 'javascript': 
                return s.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/<\//g,'<\/');
            };
            return s;
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'indent',
        function(s, repeat, indentWith)
        {
            repeat = repeat ? repeat : 4;
            indentWith = indentWith ? indentWith : ' ';
            
            var indentStr = '';
            while (repeat--)
            {
                indentStr += indentWith;
            }
            
            var tail = s.match(/\n+$/);
            return indentStr + s.replace(/\n+$/,'').replace(/\n/g,'\n'+indentStr) + (tail ? tail[0] : '');
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'lower', 
        function(s)
        {
            return s.toLowerCase();
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'nl2br', 
        function(s)
        {
            return s.replace(/\n/g,'<br />\n');
        }
    );

    /** 
        only modifiers (flags) 'i' and 'm' are supported 
        backslashes should be escaped e.g. \\s
    */
    jSmart.prototype.registerPlugin(
        'modifier', 
        'regex_replace',
        function(s, re, replaceWith)
        {
            var pattern = re.match(/^ *\/(.*)\/(.*) *$/);
            return (new String(s)).replace(new RegExp(pattern[1],'g'+(pattern.length>1?pattern[2]:'')), replaceWith);
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'replace',
        function(s, search, replaceWith)
        {
            if (!search)
            {
                return s;
            }
            s = new String(s);
            search = new String(search);
            replaceWith = new String(replaceWith);
            var res = '';
            var pos = -1;
            for (pos=s.indexOf(search,pos); pos>=0; pos=s.indexOf(search,pos))
            {
                res += s.slice(0,pos) + replaceWith;
                pos += search.length;
                s = s.slice(pos);
            }
            return res + s;
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'spacify', 
        function(s, space)
        {
            if (!space)
            {
                space = ' ';
            }
            return s.replace(/(\n|.)(?!$)/g,'$1'+space);
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'string_format', 
        function(s, fmt)
        {
            return jSmart.prototype.PHPJS('sprintf','string_format').sprintf(fmt,s);
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'strip',
        function(s, replaceWith)
        {
            replaceWith = replaceWith ? replaceWith : ' ';
            return (new String(s)).replace(/[\s]+/g, replaceWith);
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'strip_tags',
        function(s, addSpace)
        {
            addSpace = (addSpace==null) ? true : addSpace;
            return (new String(s)).replace(/<[^>]*?>/g, addSpace ? ' ' : '');
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'truncate', 
        function(s, length, etc, breakWords, middle)
        {
            length = length ? length : 80;
            etc = (etc!=null) ? etc : '...';
            
            if (s.length <= length)
            {
                return s;
            }

            length -= Math.min(length,etc.length);
            if (middle)
            {
                //one of floor()'s should be replaced with ceil() but it so in Smarty 
                return s.slice(0,Math.floor(length/2)) + etc + s.slice(s.length-Math.floor(length/2));
            }

            if (!breakWords)
            {
                s = s.slice(0,length+1).replace(/\s+?(\S+)?$/,'');
            }
          
            return s.slice(0,length) + etc;
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'upper', 
        function(s)
        {
            return s.toUpperCase();
        }
    );

    jSmart.prototype.registerPlugin(
        'modifier', 
        'wordwrap', 
        function(s, width, wrapWith, breakWords)
        {
	         width = width ? width : 80;
	         wrapWith = wrapWith ? wrapWith : '\n';
	         
	         width -= Math.min(width,wrapWith.length);

	         var lines = s.split('\n');
	         var i = 0;
	         for (i=0; i<lines.length; ++i)
	         {
		          var line = lines[i];
		          var res = '';
		          var pos = 0;
		          while (pos+width < line.length)
		          {
			           var part = line.slice(pos,pos+width+1);
			           if (!breakWords)
			           {
				            part = part.replace(/(\s+)\S+$/,'$1');
			           }
			           part = part.slice(0,width);
			           pos += part.length;
			           res += part.replace(/\s+$/,'').replace(/^\s+/,'') + wrapWith;
                    while (line.charAt(pos).match(/\s/))
                    {
                        ++pos;
                    }
		          }
		          lines[i] = res + line.slice(pos);
	         }
	         return lines.join('\n');
        }
    );


    String.prototype.fetch = function(data) 
    {
        var tpl = new jSmart(this);
        return tpl.fetch(data);
    };

})()