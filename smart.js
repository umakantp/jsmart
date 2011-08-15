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

    /**
       finds matching closing tag
    */
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

    function replaceSmartyQualifiers(s)
    {
        s = s.replace(/([^ ]+|\([^)]+\))is[ ]*div[ ]*by([^ ]+|\([^)]+\))/g,'!($1%$2)');
        s = s.replace(/([^ ]+|\([^)]+\))is[ ]*not[ ]*div[ ]*by([^ ]+|\([^)]+\))/g,'($1%$2)');
        s = s.replace(/([^ ]+|\([^)]+\))[ ]*is[ ]*even[ ]*/g,'!($1%2)');
        s = s.replace(/([^ ]+|\([^)]+\))[ ]*is[ ]*not[ ]*even[ ]*/g,'($1%2)');
        s = s.replace(/([^ ]+|\([^)]+\))[ ]*is[ ]*even[ ]*by[ ]*([^ ]+|\([^)]+\))/g,'!($1/$2)%2)');
        s = s.replace(/([^ ]+|\([^)]+\))[ ]*is[ ]*not[ ]*even[ ]*by[ ]*([^ ]+|\([^)]+\))/g,'($1/$2)%2)');
        s = s.replace(/([^ ]+|\([^)]+\))[ ]*is[ ]*odd[ ]*/g,'($1%2)');
        s = s.replace(/([^ ]+|\([^)]+\))[ ]*is[ ]*not[ ]*odd[ ]*/g,'!($1%2)');
        s = s.replace(/([^ ]+|\([^)]+\))[ ]*is[ ]*odd[ ]*by[ ]*([^ ]+|\([^)]+\))/g,'($1/$2)%2)');
        s = s.replace(/([^ ]+|\([^)]+\))[ ]*is[ ]*not[ ]*odd[ ]*by[ ]*([^ ]+|\([^)]+\))/g,'!($1/$2)%2)');
        s = s.replace(/([) ])eq([ (])/g,'$1==$2');
        s = s.replace(/([) ])(ne|neq)([ (])/g,'$1!=$3');
        s = s.replace(/([) ])gt([ (])/g,'$1>$2');
        s = s.replace(/([) ])lt([ (])/g,'$1<$2');
        s = s.replace(/([) ])(ge|gte)([ (])/g,'$1>=$2');
        s = s.replace(/([) ])(le|lte)([ (])/g,'$1<=$2');
        s = s.replace(/([) ])mod([ (])/g,'$1%$2');
        s = s.replace(/([( ])not([( ])/g,'$1!$2');
        return s;
    }


    var buildInFunctions = 
        {
            section: 
            {
                type: 'block',
                parse: function(params, tree, content)
                {
                    var subTree = [];
                    var subTreeElse = [];
                    tree.push({
                        type: 'build-in',
                        name: 'section',
                        params: parseParams(params),
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
                    
                    var params = parseParams("varName='"+res[1]+"' from="+res[2]+" to="+res[3]+" step="+(res[4]?res[4]:'1')+" "+res[5]);
                    var subTree = [];
                    var subTreeElse = [];
                    tree.push({
                        type: 'build-in',
                        name: 'for',
                        params: params,
                        subTree: subTree,
                        subTreeElse: subTreeElse
                    });

                    var findElse = findElseTag('for\s[^}]+', '\/for', 'forelse', content);
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
                    var condTree = [];
                    parseVar(replaceSmartyQualifiers(paramStr), condTree);

                    var subTreeIf = [];
                    var subTreeElse = [];
                    tree.push({
                        type: 'build-in',
                        name: 'if',
                        cond: condTree,
                        subTreeIf: subTreeIf,
                        subTreeElse: subTreeElse
                    });

                    var findElse = findElseTag('if\s+[^}]+', '\/if', 'else[^}]*', content);
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
                    if (process(node.cond, data))
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

                    var findElse = findElseTag('foreach\s[^}]+', '\/foreach', 'foreachelse', content);
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

            'while': 
            {
                type: 'block',
                parse: function(params, tree, content)
                {
                    params = replaceSmartyQualifiers(params);
                    var subTree = [];
                    tree.push({
                        type : 'build-in',
                        name : 'while',
                        params : params,
                        subTree : subTree
                    });
                    parse(content, subTree);
                },

                process: function(node, data)
                {
                    var s = '';
                    var res = execute(node.params, data);
                    while (execute(node.params, data))
                    {
                        s += process(node.subTree, data);
                    }
                    return s;
                }
            },

            capture: 
            {
                type: 'block',
                parse: function(params, tree, content)
                {
                    var subTree = [];
                    tree.push({
                        type : 'build-in',
                        name : 'capture',
                        params : parseParams(params),
                        subTree : subTree
                    });
                    parse(content, subTree);
                },

                process: function(node, data)
                {
                    var params = getActualParamValues(node.params, data);
                    var capture = process(node.subTree, data);

                    data.$smarty.capture[params.__get('name','default')] = capture;

                    var assign = params.__get('assign',null);
                    if (assign)
                    {
                        data['$'+assign] = capture;
                    }

                    var append = params.__get('append',null);
                    if (append)
                    {
                        append = '$'+append;
				            if (append in data)
				            {
					             if (data[append] instanceof Array)
					             {
						              data[append].push( capture );
					             }
				            }
				            else
				            {
					             data[append] = [ capture ];
				            }
                    }

                    return '';
                }
            },
            'function': 
            {
                type: 'block',
                parse: function(paramStr, tree, content)
                {
                    var params = parseParams(paramStr);
                    var subTree = [];
                    var funcName = params.name;
                    plugins[funcName] = 
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
                parse: function(params, tree, content) {}
            },

            javascript: 
            {
                type: 'block',
                parse: function(params, tree, content)
                {
                    tree.push({
                        type: 'build-in',
                        name: 'javascript',
                        code: content
                    });
                },

                process: function(node, data)
                {
                    execute(node.code, data);
                    return '';
                }
            },

            include:
            {
                type: 'function',
                parse: function(paramStr, tree)
                {
                    tree.push({
                        type: 'build-in',
                        name: 'include',
                        params: parseParams(paramStr)
                    });
                },

                process: function(node, data)
                {
                    var params = getActualParamValues(node.params,data);

                    var file = params.file;
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

                    var s = process(files[file], obMerge('$',obMerge('',{},data),params));
                    if ('assign' in node.params)
                    {
                        data['$'+params.assign] = s;
                        return '';
                    }
                    return s;
                }
            },

            'extends':
            {
                type: 'function',
                parse: function(paramStr, tree)
                {
                    var params = parseParams(paramStr);
                    var file = params.file;
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
                    };

                    var tree = [];
                    parse(content, tree);

                    parseVar = __parseVar;

                    if (!(params.name in blocks))
                    {
                        blocks[params.name] = [];
                    }
                    blocks[params.name].push({tree:tree, params:params});
                },

                process: function(node, data)
                {
                    data.$smarty.block.parent = data.$smarty.block.child = '';
                    this.processBlocks(blocks[node.params.name], blocks[node.params.name].length-1, data);
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

            'eval':
            {
                type: 'function',
                parse: function(params, tree)
                {
                    tree.push({
                        type: 'build-in',
                        name: 'eval',
                        params: parseParams(params)
                    });
                },

                process: function(node, data)
                {
                    var params = getActualParamValues(node.params, data);
                    var tree = [];
                    parse(params['var'], tree);
                    var s = process(tree, data);
                    var assignVar = params.__get('assign',false);
                    if (assignVar)
                    {
                        data['$'+assignVar] = s;
                    }
                    else
                    {
                        return s;
                    }
                    return '';
                }
            },

            assign:
            {
                type: 'function',
                parse: function(paramsStr, tree)
                {
                    var params = parseParams(paramsStr);
                    tree.push({
                        type: 'build-in',
                        name: 'assign',
                        params: params
                    });
                },

                process: function(node, data)
                {
                    var params = getActualParamValues(node.params, data);
                    var varName = ('shorthand' in node.params) ? node.params['var'] : '$'+params.__get('var');

                    with ( {__data:data, __v: params.__get('value','')} )
                    { 
                        if (varName.match(/\[\]$/))
                        {
                            varName = varName.replace(/\[\]$/,'');
                            eval('__data.'+varName+'.push(__v)'); 
                        }
                        else
                        {
                            eval('__data.'+varName+'=__v'); 
                        }
                    }
                    return '';
                }
            },

            append:
            {
                type: 'function',
                parse: function(params, tree)
                {
                    tree.push({
                        type: 'build-in',
                        name: 'append',
                        params: parseParams(params)
                    });
                },

                process: function(node, data)
                {
                    var params = getActualParamValues(node.params, data);
                    var varName = '$' + params['var'];
                    if (!(varName in data) || !(data[varName] instanceof Array))
                    {
                        data[varName] = [];
                    }

                    var index = params.__get('index',null);
                    if (!index)
                    {
                        data[varName].push(params['value']);
                    }
                    else
                    {
                        data[varName][index] = params['value'];
                    }
                    return '';
                }
            },

            strip:
            {
                type: 'block',
                parse: function(params, tree, context)
                {
                    parse(context.replace(/[ \t]*[\r\n]+[ \t]*/g, ''), tree);
                }
            },

            literal:
            {
                type: 'block',
                parse: function(params, tree, context)
                {
                    tree.push({
                        type: 'text',
                        data: context
                    });
                }
            },

            ldelim:
            {
                type: 'function',
                parse: function(params, tree)
                {
                    tree.push({
                        type: 'text',
                        data: jSmart.prototype.ldelim
                    });
                }
            },

            rdelim:
            {
                type: 'function',
                parse: function(params, tree)
                {
                    tree.push({
                        type: 'text',
                        data: jSmart.prototype.rdelim
                    });
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
            parseText(s.slice(0,openTag.index),tree);
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
                }
                else if (openTag[1].match(/\s*\w+\s*[(]/))
                {
                    parseFunc(nm, parseParams(params.replace(/^\s*[(]\s*/,''), '\\s*,\\s*'), tree);
                }
                else
                {
                    parseVar(openTag[1],tree);
                }
            }
            else         //variable
            {
                res = openTag[1].match(/^\s*([$]\w+(?:[.]\w+|\[(?:"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')?\])*)\s*=([^=].*)\s*$/);
                if (res)    //variable assignment
                {
                    buildInFunctions['assign'].parse(' var='+res[1]+' shorthand=1 value='+res[2].replace(/^\s+/,''), tree);
				        s = s.replace(/^\n/,'');
                }
                else   //output variable
                {
                    parseVar(openTag[1],tree);
                }
            }
        }
        parseText(s, tree);
    }

    function parseText(text, tree)
    {
        if (text.length)
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
        }
        return tree;
    }

    function parseVar(name, tree)
    {
        tree.push({
            type: 'var',
            name: prepareVar(name)
        });
    }

    function parseFunc(name, params, tree)
    {
        tree.push({
            type: 'func',
            name: name,
            params: params
        });
    }

    var paramTypes = 
        [
            {
                re: /^[$][\w@]+(?:[.]\w+|\[(?:"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|\d+|[$][\w@]+)?\])*/,  //var
                parse: function(s, param)
                {
                    parseVar(param.value, param.tree);
                    param.tree.paramIsVar = !parseModifiers(s, param);
                }
            },
            {
                re: /^(true|false)/i,  //bool
                parse: function(s, param)
                {
                    param.value = param.value.match(/^true$/i);
                    parseText(param.value ? '1' : '', param.tree);
                }
            },
            {
                re: /^'[^'\\]*(?:\\.[^'\\]*)*'/, //single quotes
                parse: function(s, param)
                {
                    param.value = eval(param.value);
                    parseText(param.value, param.tree);
                    parseModifiers(s, param);
                }
            },
            {
                re: /^"[^"\\]*(?:\\.[^"\\]*)*"/,  //double quotes
                parse: function(s, param)
                {
                    param.value = eval(param.value);
                    var isVar = param.value.match(paramTypes[0].re);
                    if (isVar && isVar[0].length == param.value.length)
                    {
                         paramTypes[0].parse(param.value, param);
                    }
                    else
                    {
                        parseText.parseEmbeddedVars = true;
                        parse(param.value, param.tree);
                        parseText.parseEmbeddedVars = false;
                        parseModifiers(s, param);
                    }
                }
            },
            {
                re: /^(\w+)\s*[(]/,  //func()
                parse: function(s, param)
                {
                    param.value += parseFunc(RegExp.$1, parseParams(s,'\\s*,\\s*'), param.tree);
                    if (s.match(/\s*[)]/))
                    {
                        param.value += RegExp.lastMatch;
                    }
                    param.length = param.value.length;
                }
            },
            {
                re: /^[^\s]*/, //static
                parse: function(s, param)
                {
                    parseText(param.value, param.tree);
                }
            }
        ];

    function parseModifiers(s, param)
    {
        if (parseModifiers.stop) {
            return false;
        }

        if (s.match(/^[|](\w+)(?:\s*(:)\s*)?/) && (RegExp.$1 in modifiers || RegExp.$1 == 'default' || eval('typeof '+RegExp.$1) == 'function'))
        {
            param.value += RegExp.lastMatch;
            param.length += RegExp.lastMatch.length;

            var fnm = RegExp.$1;
            if (fnm == 'default')
            {
                fnm = 'defaultValue';
            }
            s = s.slice(RegExp.lastMatch.length).replace(/^\s+/,'');

            parseModifiers.stop = true;
            var params = parseParams(RegExp.$2?s:'', '\\s*:\\s*');
            parseModifiers.stop = false;

            params.unshift(param.value);
            params.__parsed.unshift(param.tree);

            param.value += params.str;
            param.length += params.str.length;
            param.tree = [];
            parseFunc(fnm,params,param.tree);

            s = s.slice(params.str.length);

            parseModifiers(s, param);
            return true;
        }
        return false;
    }

    function parseParam(s)
    {
        var param = { tree:[] };
        if (s.match(new RegExp('^'+jSmart.prototype.ldelim)))
        {
            var tag = findTag('.*',s);
            if (tag)
            {
                param.value = tag[0];
                param.length = param.value.length;
                parse(param.value, param.tree);
                return param;
            }
        }
        var i=0;
        for (; i<paramTypes.length; ++i)
        {
            if (s.match(paramTypes[i].re))
            {
                param.value = RegExp.lastMatch;
                param.length = RegExp.lastMatch.length;
                paramTypes[i].parse(s.slice(param.length), param);
                return param;
            }
        }
        return false;
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

            var param = parseParam(s);
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

                params[param.value] = true;
                params.__parsed[param.value] = parseText('1',[]);
		      }

            params.str += s.slice(0,param.length);
            s = s.slice(param.length);

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
        var subTree = [];
        tree.push({
            type: 'plugin',
            name: name,
            params: params,
            subTree: subTree
        });
        parse(content,subTree);
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
                var tree = params.__parsed[nm];
                var v = '';

                if (tree.paramIsVar && isValidVar(tree[0].name, data))
                {
                    with (data)
                    {
                        v = eval(tree[0].name);
                    }
                }
                else
                {
                    v = process(tree, data);
                }

                if (typeof(v) == 'string' && v.match(/^\d+$/) && !isNaN(v))
                {
                    v = parseInt(v);
                }
                actualParams[nm] = v;
            }
        }

        actualParams.__get = function(nm,defVal)
        {
            return (nm in actualParams && typeof(actualParams[nm]) != 'undefined') ? actualParams[nm] : defVal;
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

    function processModifierParams(s, params)
    {
        var re = /^:(".+?"|'.+?'|.*?)([\s:|,))]|$)/;
        var found = null;
        for (found=s.match(re); found; found=s.match(re))
        {
            params.push(found[1]);
            s = s.slice(found[1].length+1);
            if (found[2] != ':')
            {
                return s;
            }
        }
        return s;
    }

    function processModifiers(s,data)
    {
        var re = /([$][^|]+|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')[|]\w+/;
        var reFunc = /^[|](\w+)(:)?/;

        var sRes = '';
        var found = null;
        for (found=s.match(re); found; found=s.match(re))
        {
	         if ((found[1].match(/^[$]/) && (isValidVar(found[1],data) || s.slice(found.index+found[1].length).match(/[|]default:/))) || found[1].match(/^['"]/))
	         {
		          sRes += s.slice(0,found.index);
                s = s.slice(found.index+found[1].length);

                var params = [found[1]];
                var foundFunc = null;
                for (foundFunc=s.match(reFunc); foundFunc; foundFunc=s.match(reFunc))
                {
                    s = s.slice(foundFunc[1].length+1);
                    if (foundFunc.length > 2)
                    {
                        s = processModifierParams(s,params);
                    }

                    if (foundFunc[1] == 'default' && params[0].match(/^[$]/))
                    {
                        try { execute(params[0], data); } catch(e) { params[0] = "''"; }
                    }

                    params = [ (foundFunc[1]=='default'?'defaultValue':foundFunc[1])+'('+params.join(',')+')' ];
                }
		          sRes += params[0];
	         }
	         else
	         {
		          sRes += s.slice(0,found.index+found[0].length);
	             s = s.slice(found.index+found[0].length);
	         }
        }
        sRes += s;
        return sRes;
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
                    s = execute(processModifiers(node.name,data), data);
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
            else if (node.type == 'func')
            {
                var params = getActualParamValues(node.params, data);
                var p = [];
                var j=0;
                for(; j<params.length; ++j)
                {
                    p.push(node.name+'__p'+j);
                    data[node.name+'__p'+j] = params[j];
                }
                s = execute(node.name + '(' + p.join(',') + ')', data);
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
                capture: {},
                foreach: {},
                section: {},
                block: {}
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

    /**
       register custom functions
    */
    jSmart.prototype.registerPlugin(
        'function', 
        'call', 
        function(params, data)
        {
            var fname = params.name;
            delete params.name;
            var assign = params.__get('assign',false);
            delete params.assign;
            var res = plugins[fname].process(params, data);
            if (assign)
            {
                data[ '$'+assign ] = res;
                return '';
            }
            return res;
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
                    assign: params.__get('assign',null)
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
            var name = '__cycle@' + params.__get('name','default');
            if (name in data)
            {
                if (params.__get('advance','true'))
                {
                    data[name].i += 1;
                }
                if (data[name].i >= data[name].arr.length || params.__get('reset',false))
                {
                    data[name].i = 0;
                }
            }
            else
            {
                var arr = [];
                var values = params['values'];
                if (values instanceof Object)
                {
                    for (nm in values)
                    {
                        arr.push(values[nm]);
                    }
                }
                else
                {
                    var delimiter = params.__get('delimiter',',');
                    arr = values.split(delimiter);
                }
                data[name] = {arr: arr, i: 0};
            }

            if (params.__get('assign',false))
            {
                data[ '$'+params['assign'] ] = data[name].arr[ data[name].i ];
                return '';
            }

            if (params.__get('print',true))
            {
                return data[name].arr[ data[name].i ];
            }

            return '';
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
/*
    jSmart.prototype.registerPlugin(
        'modifier', 
        'date_format', 
        function(s)
        {
        }
    );
*/
    jSmart.prototype.registerPlugin(
        'modifier', 
        'defaultValue',
        function(s, value)
        {
            if (s) {
                return s;
            }
            return s ? s : (value ? value : '');
        }
    );
/*
    jSmart.prototype.registerPlugin(
        'modifier', 
        'escape', 
        function(s)
        {
        }
    );
*/
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
            s = new String(s);
            var res = '';
            var pos = -1;
            for (pos=s.indexOf(search); pos>=0; pos=s.indexOf(search))
            {
                res += s.slice(0,pos) + replaceWith;
                s = s.slice(pos+search.length);
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
/*
    jSmart.prototype.registerPlugin(
        'modifier', 
        'string_format', 
        function(s, fmt)
        {
            return sprintf(fmt, s);
        }
    );
*/
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