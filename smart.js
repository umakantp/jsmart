/** 
 * @preserve jSmart Javascript template engine
 * http://code.google.com/p/jsmart/
 *
 * Copyright 2011, Maxim Miroshnikov <miroshnikov at gmail dot com> 
 * jSmart is licensed under the GNU General Public License
 * http://www.apache.org/licenses/LICENSE-2.0
*/


(function() {

    /**
       Split the given string by a regular expression, 
       parenthesized expression in the delimiter pattern added to array (at odd indexes),
       like PHP preg_split() with flag PREG_SPLIT_DELIM_CAPTURE
    */
    function reSplit(re, s)
    {
        var a = [];
        var found=s.match(re);
        for (; found; found=s.match(re))
        {
            a.push(s.slice(0,found.index));
            if (found[1]) {
                a.push(found[1]);
            }
            s = s.slice(found.index + found[0].length);
        }
        if (s.length) {
            a.push(s);
        }
        return a;
    }

    /**
       merges two or more objects into one and add prefix at the beginning of every property name at the top level
    */
    function obMerge(prefix, ob1, ob2 /*, ...*/)
    {
        for (var i=2; i<arguments.length; ++i)
        {
            for (var nm in arguments[i]) 
            {
                if (typeof(arguments[i][nm]) == 'object')
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
       @return  number of own properties in ob
    */
    function countProperties(ob)
    {
        var count = 0;
        for (k in ob) 
        {
            if (ob.hasOwnProperty(k))
            {
                count++;
            }
        }
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
            if (s.substr(i,1) == '{')
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
            else if (s.substr(i,1) == '}')
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

    function prepare(code)
    {
        if (!code.match(/^ *['"].+["'] *$/))
        {
            return code.replace(
                new RegExp('\\$([\\w]+)@(index|iteration|first|last|show|total)','gi'),
                "\$$$1__$2"
            );
        }
        return code;
    }

    function execute(__code, __data)
    {
        if (typeof(__code) == 'string')
        {
            with (__data)
            {
                return eval(__code);
            }
        }
        return __code;
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
            'section': 
            {
                'type':'block',
                'parse': function(params, tree, content)
                {
                    var subTree = [];
                    var subTreeElse = [];
                    tree.push({
                        'type' : 'build-in',
                        'name' : 'section',
                        'params' : parseParams(params),
                        'subTree' : subTree,
                        'subTreeElse' : subTreeElse
                    });

                    var findElse = findElseTag('section [^}]+', '\/section', 'sectionelse', content);
                    if (!findElse)
                    {
                        parse(content, subTree);
                    }
                    else
                    {
                        parse(content.slice(0,findElse.index),subTree);
                        parse(content.slice(findElse.index+findElse[0].length).replace(/^[\r\n]/,''), subTreeElse);
                    }            
                },

                'process': function(node, data)
                {
                    var params = getActualParamValues(node.params, data);

                    var sectionProps = {};
                    data['$smarty']['section'][params.name] = sectionProps;

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
                            countProperties(params.loop),
                            params.__get('step',1),
                            params.__get('max',Number.MAX_VALUE),
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
                            params.__get('max',Number.MAX_VALUE),
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

                'foreach' : function(nm, from, to, step, max, data, props, callback)
                {
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
                'type':'block',
                'parse': function(paramstr, tree, content)
                {
                    var res = paramstr.match(/^ *\$(\w+) *= *([^ ]+) *to *([^ ]+) *(step *([^ ]+))? *(.*)$/);
                    if (!res)
                    {
                        throw new Error('Invalid {for} parameters: '+paramstr);
                    }

                    var params = parseParams(' '+res[6]);
                    params.varName = "'"+res[1]+"'";
                    params.from = res[2];
                    params.to = res[3];
                    params.step = res[5];

                    var subTree = [];
                    var subTreeElse = [];
                    tree.push({
                        'type' : 'build-in',
                        'name' : 'for',
                        'params' : params,
                        'subTree' : subTree,
                        'subTreeElse' : subTreeElse
                    });

                    var findElse = findElseTag('for [^}]+', '\/for', 'forelse', content);
                    if (!findElse)
                    {
                        parse(content, subTree);
                    }
                    else
                    {
                        parse(content.slice(0,findElse.index),subTree);
                        parse(content.slice(findElse.index+findElse[0].length), subTreeElse);
                    }            
                },

                'process': function(node, data)
                {
                    var params = getActualParamValues(node.params, data);
                    var step = params.__get('step',1);
                    var max = params.__get('max',Number.MAX_VALUE);
                    var count = 0;
                    var s = '';
			           var total = Math.min( Math.ceil( ((step > 0 ? params.to-params.from : params.from-params.to)+1) / Math.abs(step)  ), max);
			           
                    for (var i=params.from; count<total; i+=step,++count)
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
                'type':'block',
                'parse': function(params, tree, content)
                {
                    params = prepare( replaceSmartyQualifiers(params) );

                    var subTreeIf = [];
                    var subTreeElse = [];
                    tree.push({
                        'type' : 'build-in',
                        'name' : 'if',
                        'params' : params,
                        'subTreeIf' : subTreeIf,
                        'subTreeElse' : subTreeElse
                    });

                    var findElse = findElseTag('if [^}]+', '\/if', 'else[^}]*', content);
                    if (!findElse)
                    {
                        parse(content, subTreeIf);
                    }
                    else
                    {
                        parse(content.slice(0,findElse.index),subTreeIf);

                        content = content.slice(findElse.index+findElse[0].length);
                        var findElseIf = findElse[1].match(/^if(.*)/);
                        if (!findElseIf)
                        {
                            parse(content.replace(/^[\r\n]/,''), subTreeElse);
                        }
                        else
                        {
                            buildInFunctions['if'].parse(findElseIf[1], subTreeElse, content.replace(/^[\r\n]/,''));
                        }
                    }
                },

                'process': function(node, data)
                {
                    if (execute(node.params, data))
                    {
                        return process(node.subTreeIf, data);
                    }
                    else
                    {
                        return process(node.subTreeElse, data);
                    }
                }
            },

            'foreach': 
            {
                'type': 'block',
                'parse': function(paramStr, tree, content)
                {
                    var arrName = null;
                    var varName = null;
                    var keyName = null;
                    var loopName = null;

                    var res = paramStr.match(/^ *\$(\w+) *as *\$(\w+) *(=> *\$(\w+))? *$/i);
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
                        'type'        : 'build-in',
                        'name'        : 'foreach',
                        'arr'         : arrName,
                        'keyName'     : keyName,
                        'varName'     : '$'+varName,
                        'loopName'    : loopName,
                        'subTree'     : subTree,
                        'subTreeElse' : subTreeElse
                    });

                    var findElse = findElseTag('foreach [^}]+', '\/foreach', 'foreachelse', content);
                    if (!findElse)
                    {
                        parse(content, subTree);
                    }
                    else
                    {
                        parse(content.slice(0,findElse.index),subTree);
                        parse(content.slice(findElse.index+findElse[0].length).replace(/^[\r\n]/,''), subTreeElse);
                    }
                },

                'process': function(node, data)
                {
                    if (node.arr in data)
                    {
                        var a = data[node.arr];
                        if (a instanceof Object)
                        {
                            var s = '';
                            var total = 0;
                            var nm = null;
                            for (nm in a)
                            {
                                ++total;
                            }
                            data[node.varName+'__total'] = total;
                            var i=0;
                            if (node.loopName)
                            {
                                data['$smarty']['foreach'][node.loopName] = {};
                                data['$smarty']['foreach'][node.loopName]['total'] = total;
                            }
                            for (nm in a)
                            {
                                data[node.varName+'__key'] = (a instanceof Array) ? parseInt(nm) : nm;
                                if (node.keyName)
                                {
                                    data['$'+node.keyName] = data[node.varName+'__key'];
                                }
                                data[node.varName] = a[nm];
                                data[node.varName+'__index'] = parseInt(i);
                                data[node.varName+'__iteration'] = parseInt(i+1);
                                data[node.varName+'__first'] = (i===0);
                                data[node.varName+'__last'] = (i==total-1);
                                
                                if (node.loopName)
                                {
                                    data['$smarty']['foreach'][node.loopName]['index'] = parseInt(i);
                                    data['$smarty']['foreach'][node.loopName]['iteration'] = parseInt(i+1);
                                    data['$smarty']['foreach'][node.loopName]['first'] = (i===0) ? 1 : '';
                                    data['$smarty']['foreach'][node.loopName]['last'] = (i==total-1) ? 1 : '';
                                }

                                s += process(node.subTree, data);
                                ++i;
                            }
                            data[node.varName+'__show'] = (i>0);
                            if (node.loopName)
                            {
                                data['$smarty']['foreach'][node.loopName]['show'] = (i>0) ? 1 : '';
                            }
                            if (i>0)
                            {
                                return s;                
                            }
                        }
                    }
                    return process(node.subTreeElse, data);
                }
            },

            'while': 
            {
                'type': 'block',
                'parse': function(params, tree, content)
                {
                    params = replaceSmartyQualifiers(params);
                    var subTree = [];
                    tree.push({
                        'type' : 'build-in',
                        'name' : 'while',
                        'params' : params,
                        'subTree' : subTree
                    });
                    parse(content, subTree);
                },

                'process': function(node, data)
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

            'capture': 
            {
                'type':'block',
                'parse': function(params, tree, content)
                {
                    var subTree = [];
                    tree.push({
                        'type' : 'build-in',
                        'name' : 'capture',
                        'params' : parseParams(params),
                        'subTree' : subTree
                    });
                    parse(content, subTree);
                },

                'process': function(node, data)
                {
                    var params = getActualParamValues(node.params, data);
                    var capture = process(node.subTree, data);

                    data['$smarty']['capture'][params.__get('name','default')] = capture;

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
                'type':'block',
                'parse': function(paramstr, tree, content)
                {
                    var params = parseParams(paramstr);
                    var subTree = [];
                    var funcName = eval(params.name);
                    delete params.name;
                    plugins[funcName] = 
                        {
                            'type': 'function',
                            'subTree' : subTree,
                            'defautParams' : params,
                            'process': function(params, data)
                            {
                                var defaults = getActualParamValues(this.defautParams,data);
                                return process(this.subTree, obMerge('$',obMerge('',{},data),defaults,params));
                            }
                        };
                    parse(content, subTree);
                }
            },

            'javascript': 
            {
                'type':'block',
                'parse': function(params, tree, content)
                {
                    tree.push({
                        'type'   : 'build-in',
                        'name'   : 'javascript',
                        'code'   : content
                    });
                },

                'process': function(node, data)
                {
                    execute(node.code, data);
                    return '';
                }
            },

            'include':
            {
                'type': 'function',
                'parse': function(params, tree)
                {
                    var params = parseParams(params);
                    var file = eval(params.file);
                    tree.push({
                        'type'   : 'build-in',
                        'name'   : 'include',
                        'file'   : file,
                        'params' : params
                    });

                    if (file in files)
                    {
                        return;
                    }
                    files[file] = [];
                    var tpl = jSmart.prototype.getTemplate(file);
                    if (typeof(tpl) != 'string')
                    {
                        throw new Error('No template for '+ file);
                    }
                    parse(stripComments(tpl.replace(/\r\n/g,'\n')), files[file]);
                },

                'process': function(node, data)
                {
                    var params = getActualParamValues(node.params,data);
                    var s = process(files[node.file], obMerge('$',obMerge('',{},data),params));
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
                'type': 'function',
                'parse': function(params, tree)
                {
                    var params = parseParams(params);
                    var file = eval(params.file);
                    var tpl = jSmart.prototype.getTemplate(file);
                    if (typeof(tpl) != 'string')
                    {
                        throw new Error('No template for '+ file);
                    }
                    parse(stripComments(tpl.replace(/\r\n/g,'\n')), tree);
                }
            },

            'block':
            {
                'type':'block',
                'parse': function(paramstr, tree, content)
                {
                    var params = parseParams(paramstr);

                    tree.push({
                        'type'   : 'build-in',
                        'name'   : 'block',
                        'blockName' : params.name
                    });

                    blocks[params.name] = [];
                    parse(content, blocks[params.name]);
                },

                'process': function(node, data)
                {
                    return process(blocks[node.blockName], data);
                }
            },


            'eval':
            {
                'type': 'function',
                'parse': function(params, tree)
                {
                    tree.push({
                        'type'   : 'build-in',
                        'name'   : 'eval',
                        'params' : parseParams(params)
                    });
                },

                'process': function(node, data)
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


            'assign':
            {
                'type': 'function',
                'parse': function(paramsStr, tree)
                {
                    var params = parseParams(paramsStr);
                    var subTree = [];
                    tree.push({
                        'type'   : 'build-in',
                        'name'   : 'assign',
                        'params' : params,
                        'subTree' : subTree
                    });
                    
                    if (params.value.match(/^ *".*" *$/))
                    {
//                      params.value.replace(/([^{])(\$[\w]+)([^}])/g,'$1{$2}$3');
                        parse(eval(params.value), subTree);
                    }
                    else
                    {
                        parseVar(params.value, subTree);
                    }
                },

                'process': function(node, data)
                {
                    var varName = ('shorthand' in node.params) ? 
                        node.params['var'] :
                        execute(node.params['var'], data);
                    execute('$'+varName+'="'+process(node.subTree, data)+'"',data);
                    return '';
                }
            },


            'append':
            {
                'type': 'function',
                'parse': function(params, tree)
                {
                    tree.push({
                        'type'   : 'build-in',
                        'name'   : 'append',
                        'params' : parseParams(params)
                    });
                },

                'process': function(node, data)
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


            'strip':
            {
                'type': 'block',
                'parse': function(params, tree, context)
                {
                    parse(context.replace(/[ \t]*[\r\n]+[ \t]*/g, ''), tree);
                }
            },


            'literal':
            {
                'type': 'block',
                'parse': function(params, tree, context)
                {
                    tree.push({
                        'type'   : 'text',
                        'data'   : context
                    });
                }
            },

            'ldelim':
            {
                'type': 'function',
                'parse': function(params, tree)
                {
                    tree.push({
                        'type'   : 'text',
                        'data'   : '{'
                    });
                }
            },

            'rdelim':
            {
                'type': 'function',
                'parse': function(params, tree)
                {
                    tree.push({
                        'type'   : 'text',
                        'data'   : '}'
                    });
                }
            }
        };

    var plugins = {};

    var blocks = {};

    var files = {};

    function parse(s, tree)
    {
        var reTag = '.+';
        for (var openTag=findTag(reTag,s); openTag; openTag=findTag(reTag,s))
        {
            parseText(s.slice(0,openTag.index),tree);
            s = s.slice(openTag.index + openTag[0].length);

            var res = openTag[1].match(/^ *(\w+)(.*)$/);
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
                }
                else if (nm in plugins)
                {
                    var plugin = plugins[nm];
                    if (plugin.type == 'function')
                    {
                        parsePluginFunc(nm, params, tree);
                    }
                }
                else
                {
                    parseVar(openTag[1],tree);
                }
			       s = s.replace(/^\n/,'');	//remove new line after any tag (like in Smarty)
            }
            else         //variable
            {
                res = openTag[1].match(/^ *\$([\[\w'"\]]+) *= *(.*) *$/);
                if (res)    //variable assignment
                {
                    buildInFunctions['assign'].parse(' var='+res[1]+' value='+res[2]+' shorthand=1', tree);
				        s = s.replace(/^\n/,'');	//remove new line after any tag (like in Smarty)
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
            tree.push({
                'type' : 'text',
                'data' : text
            });
        }
    }

    function parseVar(name, tree)
    {
        tree.push({
            'type' : 'var',
            'name' : prepare(name)
        });
    }

    function parseParams(paramsStr)
    {
        var params = {};
        var a = reSplit(/ +([\w]+) *=/, paramsStr);
        for (var i=1; i<a.length-1; i+=2)
        {
            params[a[i]] = prepare(a[i+1]);
        }
        return params;
    }

    function parsePluginFunc(name, params, tree)
    {
        tree.push({
            'type' : 'plugin',
            'name' : name,
            'params' : parseParams(params)
        });
    }

    function getActualParamValues(params,data)
    {
        var actualParams = {};
        for (var nm in params)
        {
            actualParams[nm] = execute(params[nm], data);
        }

        actualParams.__get = function(nm,defVal)
        {
            return (nm in actualParams && typeof(actualParams[nm]) != 'undefined') ? actualParams[nm] : defVal;
        };
        return actualParams;
    }

    function process(tree, data)
    {
        var s = '';
        for (var i=0; i<tree.length; ++i)
        {
            var node = tree[i];
            if (node.type == 'text')
            {
                s += node.data;
            }
            else if (node.type == 'var')
            {
                s += execute(node.name, data);
            }
            else if (node.type == 'build-in')
            {
                s += buildInFunctions[node.name].process(node,data);
            }
            else if (node.type == 'plugin')
            {
                s += plugins[node.name].process(getActualParamValues(node.params,data), data);
            }
        }
        return s;    
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
        }
        return sRes + s;
    }


    jSmart = function(tpl)
    {
        this.tree = [];
        tpl = stripComments(tpl.replace(/\r\n/g,'\n'));
        parse(tpl, this.tree);
    };

    jSmart.prototype.fetch = function(data)
    {
        var smarty = {
            'smarty' : 
            {
                'capture': {},
                'foreach': {},
                'section': {}
            }
        };
        return process(this.tree, obMerge('$',{},data,smarty));
    };

    /**
       @param type  valid values are 'function' or 'block'
       @param callback  func(params,data)  or  block(params,content,data,repeat)
    */
    jSmart.prototype.registerPlugin = function(type, name, callback)
    {
        plugins[name] = 
            {
                'type': type,
                'process': callback
            };
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



    /**
       register custom functions
    */

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
                    'value' : parseInt(params.__get('start',1)),
                    'skip' : params.__get('skip',1),
                    'direction' : params.__get('direction','up'),
                    'assign' : params.__get('assign',null)
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
                data[name] = 
                    {
                        'arr' : arr,
                        'i' : 0
                    };
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

    String.prototype.fetch = function(data) 
    {
        var tpl = new jSmart(this);
        return tpl.fetch(data);
    };

})()