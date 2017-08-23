define(['../util/objectmerge', '../util/trimallquotes', '../util/evalstring'], function (ObjectMerge, TrimAllQuotes, EvalString) {

  // Parser object. Plain object which just does parsing.
  var jSmartParser = {

    // jSmart object used for current parsing.
    jSmart: {},

    // Object which is copy of jSmart.smarty for local modification.
    smarty: {},

    // Parse the template and return the data.
    getParsed: function (template, that) {
      var tree, smarty;
      // Copy the jSmart object, so we could use it while parsing.
      this.jSmart = that;
      // Create a copy of smarty object, as we modify that data and
      // we want to keep a copy rather than modifying original jSmart object.
      ObjectMerge(this.smarty, that.smarty);

      // Parse the template and get the output.
      tree = this.parse(template),
      smarty = this.smarty;
      // Empty parser objects. Clean up.
      // We do not want old data held up here.
      this.jSmart = {};
      this.smarty = {};
      return tree;
    },

    // Parse the template and generate tree.
    parse: function (tpl) {
      var tree = [],
          openTag,
          tag,
          name,
          paramStr,
          node;

      for (openTag = this.findTag('', tpl); openTag; openTag = this.findTag('', tpl))  {
        if (openTag.index) {
          tree = tree.concat(this.parseText(tpl.slice(0, openTag.index)));
        }
        tpl = tpl.slice((openTag.index + openTag[0].length));
        tag = openTag[1].match(/^\s*(\w+)(.*)$/);

        if (tag) {
          // Function?!
          name = tag[1];
          paramStr = (tag.length > 2) ? tag[2].replace(/^\s+|\s+$/g, '') : '';
          if (name in this.buildInFunctions) {
            var buildIn = this.buildInFunctions[name];
            var params = ('parseParams' in buildIn ? buildIn.parseParams : this.parseParams.bind(this))(paramStr);
            if (buildIn.type == 'block') {
              // TODO:: Design block plugins later.
              // Remove new line after block open tag (like in Smarty)
              tpl = tpl.replace(/^\n/, '');
              var closeTag = this.findCloseTag('\/'+name, name+' +[^}]*', tpl);
              tree = tree.concat(buildIn.parse.call(this, params, tpl.slice(0, closeTag.index)));
              tpl = tpl.slice(closeTag.index+closeTag[0].length);
            } else {
              tree = tree.concat(buildIn.parse.call(this, params));
              if (name == 'extends') {
                // TODO:: How to implement this?
                //tree = []; //throw away further parsing except for {block}
              }
            }
            tpl = tpl.replace(/^\n/,'');
          }
        } else {
          // Variable.
          node = this.buildInFunctions.expression.parse.call(this, openTag[1]);
          if (node.type=='build-in' && node.name=='operator' && node.op == '=') {
            tpl = tpl.replace(/^\n/, '');
          }
          tree.push(node);
        }
      }
      if (tpl) {
        tree = tree.concat(this.parseText(tpl));
      }
      console.log(tree);
      return tree;
    },

    // Find a first {tag} in the string.
    findTag: function(expression, s) {
      var openCount = 0,
          offset = 0,
          i,
          ldelim = this.smarty.ldelim,
          rdelim = this.smarty.rdelim,
          skipInWhitespace = this.jSmart.autoLiteral,
          expressionAny = /^\s*(.+)\s*$/i,
          expressionTag = expression ? new RegExp('^\\s*('+expression+')\\s*$','i') : expressionAny,
          sTag,
          found;

      for (i = 0; i < s.length; ++i) {
        if (s.substr(i, ldelim.length) == ldelim) {
          if (skipInWhitespace && (i + 1) < s.length && s.substr((i + 1), 1).match(/\s/)) {
            continue;
          }
          if (!openCount) {
            s = s.slice(i);
            offset += parseInt(i);
            i = 0;
          }
          ++openCount;
        } else if (s.substr(i, rdelim.length) == rdelim) {
          if (skipInWhitespace && (i - 1) >= 0 && s.substr((i - 1), 1).match(/\s/)) {
            continue;
          }
          if (!--openCount) {
            sTag = s.slice(ldelim.length, i).replace(/[\r\n]/g, ' '),
            found = sTag.match(expressionTag);
            if (found) {
              found.index = offset;
              found[0] = s.slice(0, (i + rdelim.length));
              return found;
            }
          }
          if (openCount < 0) {
            // Ignore any number of unmatched right delimiters.
            openCount = 0;
          }
        }
      }
      return null;
    },

    findElseTag: function(reOpen, reClose, reElse, s) {
      var offset = 0;
      for (var elseTag = this.findTag(reElse, s); elseTag; elseTag = this.findTag(reElse, s)) {
        var openTag = this.findTag(reOpen, s);
        if (!openTag || openTag.index > elseTag.index) {
          elseTag.index += offset;
          return elseTag;
        } else {
          s = s.slice(openTag.index+openTag[0].length);
          offset += openTag.index+openTag[0].length;
          var closeTag = this.findCloseTag(reClose,reOpen,s);
          s = s.slice(closeTag.index + closeTag[0].length);
          offset += closeTag.index + closeTag[0].length;
        }
      }
      return null;
    },

    // Find closing tag which matches. expressionClose.
    findCloseTag: function(expressionClose, expressionOpen, s) {
      var sInner = '',
          closeTag = null,
          openTag = null,
          findIndex = 0;

      do {
        if (closeTag) {
          findIndex += closeTag[0].length;
        }
        closeTag = this.findTag(expressionClose, s);
        if (!closeTag) {
          throw new Error('Unclosed '+this.smarty.ldelim+expressionOpen+this.smarty.rdelim);
        }
        sInner += s.slice(0, closeTag.index);
        findIndex += closeTag.index;
        s = s.slice((closeTag.index + closeTag[0].length));
        openTag = this.findTag(expressionOpen, sInner);
        if (openTag) {
          sInner = sInner.slice((openTag.index + openTag[0].length));
        }
      } while(openTag);

      closeTag.index = findIndex;
      return closeTag;
    },

    bundleOp: function (i, tree, precedence) {
      var op = tree[i];
      if (op.name == 'operator' && op.precedence == precedence && !op.params.__parsed) {
        if (op.optype == 'binary') {
            op.params.__parsed = [tree[(i - 1)],tree[(i + 1)]];
            tree.splice((i - 1), 3, op);
            return [true, tree];
        } else if (op.optype == 'post-unary') {
            op.params.__parsed = [tree[(i - 1)]];
            tree.splice((i - 1), 2, op);
            return [true, tree];
        }

        op.params.__parsed = [tree[(i + 1)]];
        tree.splice(i, 2, op);
      }
      return [false, tree];
    },

    composeExpression: function(tree) {
      var i = 0,
          data;
      for (i = 0; i < tree.length; ++i) {
        if (tree[i] instanceof Array) {
          tree[i] = this.composeExpression(tree[i]);
        }
      }

      for (var precedence = 1; precedence < 14; ++precedence) {
        if (precedence == 2 || precedence == 10) {
          for (i = tree.length; i > 0; --i) {
              data = this.bundleOp(i-1, tree, precedence);
              i -= data[0];
              tree = data[1];
          }
        } else {
          for (i=0; i<tree.length; ++i) {
            data = this.bundleOp(i, tree, precedence);
            i -= data[0];
            tree = data[1];
          }
        }
      }
      // Only one node should be left.
      return tree[0];
    },

    getMatchingToken: function (s) {
      for (var i = 0; i < this.tokens.length; ++i) {
        if (s.match(this.tokens[i].regex)) {
          return i;
        }
      }
      return false;
    },

    parseVar: function (s, name) {
      var expression = /^(?:\.|\s*->\s*|\[\s*)/,
          op,
          data = {value: '', tree: []},
          lookUpData,
          token = '',
          parts = [{type: 'text', data: name}];

      for (op = s.match(expression); op; op = s.match(expression)) {
        token += op[0];
        s = s.slice(op[0].length);
        if (op[0].match(/\[/)) {
          data = this.parseExpression(s);
          if (data.tree) {
            token += data.value;
            parts.push(data.tree);
            s = s.slice(data.value.length);
          }
          var closeOp = s.match(/\s*\]/);
          if (closeOp) {
            token += closeOp[0];
            s = s.slice(closeOp[0].length);
          }
        } else {
          var parseMod = this.parseModifiersStop;
          this.parseModifiersStop = true;
          lookUpData = this.lookUp(s, data.value);

          if (lookUpData) {
            data.tree = data.tree.concat(lookUpData.tree);
            data.value = lookUpData.value;
            token += lookUpData.value;

            if (lookUpData.ret) {
              var part = data.tree[0];
              if (part.type == 'plugin' && part.name == '__func') {
                  part.hasOwner = true;
              }
              parts.push(part);
              s = s.slice(data.value.length);
            } else {
              data = false;
            }
          }
          this.parseModifiersStop = parseMod;
        }
        if (!data) {
          parts.push({type:'text', data:''});
        }
      }

      return {s: s, token: token, tree: [{type: 'var', parts: parts}]};
    },

    parseFunc: function(name, params, tree) {
      params.__parsed.name = this.parseText(name, [])[0];
      tree.push({
          type: 'plugin',
          name: '__func',
          params: params
      });
      return tree;
    },

    parseOperator: function(op, type, precedence) {
      return [{
        type: 'build-in',
        name: 'operator',
        op: op,
        optype: type,
        precedence: precedence,
        params: {}
      }];
    },

    parsePluginFunc: function (name, params) {
      return [{
          type: 'plugin',
          name: name,
          params: params
      }];
    },

    parseModifiers: function (s, tree) {
      var modifier = s.match(/^\|(\w+)/),
          value = '',
          funcName;
      if (this.parseModifiersStop) {
        return;
      }
      if (!modifier) {
        return;
      }
      value += modifier[0];

      funcName = ((modifier[1] == 'default') ? 'defaultValue' : modifier[1]);
      s = s.slice(modifier[0].length).replace(/^\s+/,'');

      this.parseModifiersStop = true;
      var params = [];
      for (var colon = s.match(/^\s*:\s*/); colon; colon = s.match(/^\s*:\s*/)) {
        value += s.slice(0, colon[0].length);
        s = s.slice(colon[0].length);
        var lookUpData = this.lookUp(s, '');
        if (lookUpData.ret) {
          value += lookUpData.value;
          params.push(lookUpData.tree[0]);
          s = s.slice(lookUpData.value.length);
        } else {
          params.push(this.parseText(''));
        }
      }
      this.parseModifiersStop = false;

      // Modifiers have the highest priority.
      params.unshift(tree.pop());
      var funcData = this.parseFunc(funcName, {__parsed: params}, []);
      tree.push(funcData[0]);

      // Modifiers can be combined.
      var selfData = this.parseModifiers(s, tree);
      // If data is returned merge the current tree and tree we got.
      if (selfData) {
        tree = tree.concat(selfData.tree);
      }
      return {value: value, tree: tree};
    },

    parseParams: function(paramsStr, regexDelim, regexName) {
      var s = paramsStr.replace(/\n/g, ' ').replace(/^\s+|\s+$/g, ''),
          params = [],
          paramsStr = '';

      params.__parsed = [];

      if (!s) {
        return params;
      }

      if (!regexDelim) {
        regexDelim = /^\s+/;
        regexName = /^(\w+)\s*=\s*/;
      }

      while (s) {
        var name = null;
        if (regexName) {
          var foundName = s.match(regexName);
          if (foundName) {
            var firstChar = foundName[1].charAt(0).match(/^\d+/),
                skip = (firstChar ? true : false);
            if (foundName[1] == 'true' || foundName[1] == 'false' || foundName[1] == 'null') {
              skip = true;
            }

            if (!skip) {
              name = TrimAllQuotes(foundName[1]);
              paramsStr += s.slice(0, foundName[0].length);
              s = s.slice(foundName[0].length);
            }
          }
        }

        var param = this.parseExpression(s);
        console.log(param);
        if (!param) {
          break;
        }

        if (name) {
          params[name] = param.value;
          params.__parsed[name] = param.tree;
        } else {
          params.push(param.value);
          params.__parsed.push(param.tree);
        }

        paramsStr += s.slice(0, param.value.length);
        s = s.slice(param.value.length);

        var foundDelim = s.match(regexDelim);
        if (foundDelim) {
          paramsStr += s.slice(0,foundDelim[0].length);
          s = s.slice(foundDelim[0].length);
        } else {
            break;
        }
      }
      params.toString = function() {
        return paramsStr;
      };
      return params;
    },

    lookUp: function (s, value) {
      var tree = [];
      if (!s) {
        return false;
      }

      if (s.substr(0, this.smarty.ldelim) == this.smarty.ldelim) {
        // TODO :: Explore more where it is used.
        tag = this.findTag('', s);
        value += tag[0];
        if (tag) {
          tree.concat(this.parse(tag[0]));
          var modData = this.parseModifiers(s.slice(value.length), tree);
          return {ret: true, tree: modData.tree, value: value};
        }
      }

      var anyMatchingToken = this.getMatchingToken(s);
      if (anyMatchingToken !== false) {
        value += RegExp.lastMatch;
        var newTree = this.tokens[anyMatchingToken].parse.call(this, s.slice(RegExp.lastMatch.length), { tree: tree, token: RegExp.lastMatch });
        if ((!!newTree) && (newTree.constructor === Object)) {
          // TODO :: figure out, how we would we get this done by
          // only getting tree (no value should be needed.)
          value += newTree.value;
          newTree = newTree.tree;
        }
        tree = tree.concat(newTree);
        return {ret: true, tree: tree, value: value};
      }
      return {ret: false, tree: tree, value: value};
    },

    // Parse expression.
    parseExpression: function (s) {
      var tree = [],
          value = '',
          data,
          tag,
          treeFromToken;

      while(true) {
        data = this.lookUp(s.slice(value.length), value);
        if (data) {
          tree = tree.concat(data.tree);
          value = data.value;
          if (!data.ret) {
            break;
          }
        } else {
          break;
        }
      }
      if (!tree.length) {
        return false;
      }
      tree = this.composeExpression(tree);
      return {tree: tree, value: value};
    },

	// Parse boolean.
    parseBool: function (boolVal) {
      return [{type: 'boolean', data: boolVal}];
    },

    // Parse text.
    parseText: function (text) {
      var tree = [];
      if (this.parseEmbeddedVars) {
        var re = /([$][\w@]+)|`([^`]*)`/;
        for (var found=re.exec(text); found; found=re.exec(text)) {
          tree.push({type: 'text', data: text.slice(0,found.index)});
          var d = this.parseExpression(found[1] ? found[1] : found[2]);
          tree.push(d.tree);
          text = text.slice(found.index + found[0].length);
        }
      }
      tree.push({type: 'text', data: text});
      return tree;
    },

    // Tokens to indentify data inside template.
    tokens: [
      {
        // Token for variable.
        'regex': /^\$([\w@]+)/,
        parse: function(s, data) {
          var dataVar = this.parseVar(s, RegExp.$1);
          var dataMod = this.parseModifiers(dataVar.s, dataVar.tree);
          if (dataMod) {
            dataVar.value += dataMod.value;
            return dataMod.tree;
          }
          return dataVar.tree;
        }
      },
  	  {
  		  // Token for boolean.
  		  'regex': /^(true|false)/i,
    		parse: function(s, data) {
    		  return this.parseBool(data.token.match(/true/i) ? true : false);
    		}
  	  },
  	  {
    		// Token for to grab data inside single quotes.
    		'regex': /^'([^'\\]*(?:\\.[^'\\]*)*)'/,
    	  parse: function(s, data) {
    		  // Data inside single quote is like string, we do not parse it.
    		  var regexStr = EvalString(RegExp.$1);
    		  var dataVar = this.parseText(s, regexStr);
    		  var dataMod = this.parseModifiers(dataVar.s, dataVar.tree);
          if (dataMod) {
    		      return dataMod.tree;
          }
          return dataVar.tree;
  	    }
  	  },
      {
        // Token for to grab data inside double quotes.
        // We parse data inside double quotes.
        'regex': /^"([^"\\]*(?:\\.[^"\\]*)*)"/,
        parse: function(s, data) {
          var v = EvalString(RegExp.$1);
          var isVar = v.match(this.tokens[0]['regex']);
          if (isVar) {
            var newData = this.parseVar(v, isVar[1]);
            if ((isVar[0] + newData.token).length == v.length) {
              return [newData.tree[0]];
            }
          }
          this.parseEmbeddedVars = true;
          var tree = [];
          tree.push({
            type: 'plugin',
            name: '__quoted',
            params: {__parsed: this.parse(v, [])}
          });
          this.parseEmbeddedVars = false;
          var modData = this.parseModifiers(s, tree);
          return modData.tree;
        }
      },
      {
        // Token for increment operator.
        'regex': /^\s*(\+\+|--)\s*/,
        parse: function(s, data) {
          if (data.tree.length && data.tree[data.tree.length-1].type == 'var') {
            return this.parseOperator(RegExp.$1, 'post-unary', 1);
          } else {
            return this.parseOperator(RegExp.$1, 'pre-unary', 1);
          }
        }
      },
      {
        // Regex for strict equal, strict not equal, equal and not equal operator.
        'regex': /^\s*(===|!==|==|!=)\s*/,
        parse: function(s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 6);
        }
      },
      {
        // Regex for equal, not equal operator.
        'regex': /^\s+(eq|ne|neq)\s+/i,
        parse: function(s, data) {
          var op = RegExp.$1.replace(/ne(q)?/,'!=').replace(/eq/,'==');
          return this.parseOperator(op, 'binary', 6);
        }
      },
      {
        // Regex for NOT operator.
        'regex': /^\s*!\s*/,
        parse: function(s, data) {
          return this.parseOperator('!', 'pre-unary', 2);
        }
      },
      {
        // Regex for NOT operator.
        'regex': /^\s+not\s+/i,
        parse: function(s, data) {
          return this.parseOperator('!', 'pre-unary', 2);
        }
      },
      {
        // Regex for =, +=, *=, /=, %= operator.
        'regex': /^\s*(=|\+=|-=|\*=|\/=|%=)\s*/,
        parse: function(s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 10);
        }
      },
      {
        // Regex for *, /, % binary operator.
        'regex': /^\s*(\*|\/|%)\s*/,
        parse: function(s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 3);
        }
      },
      {
        // Regex for mod operator.
        'regex': /^\s+mod\s+/i,
        parse: function(s, data) {
          return this.parseOperator('%', 'binary', 3);
        }
      },
      {
        // Regex for +/- operator.
        'regex': /^\s*(\+|-)\s*/,
        parse: function(s, data) {
          if (!data.tree.length || data.tree[data.tree.length-1].name == 'operator') {
            return this.parseOperator(RegExp.$1, 'pre-unary', 4);
          } else {
            return this.parseOperator(RegExp.$1, 'binary', 4);
          }
        }
      },
      {
        // Regex for less than, greater than, less than equal, reather than equal.
        'regex': /^\s*(<=|>=|<>|<|>)\s*/,
        parse: function(s, data) {
          return this.parseOperator(RegExp.$1.replace(/<>/,'!='), 'binary', 5);
        }
      },
      {
        // Regex for less than, greater than, less than equal, reather than equal.
        'regex': /^\s+(lt|lte|le|gt|gte|ge)\s+/i,
        parse: function(s, data) {
          var op = RegExp.$1.replace(/l(t)?e/,'<').replace(/lt/,'<=').replace(/g(t)?e/,'>').replace(/gt/,'>=');
          return this.parseOperator(op, 'binary', 5);
        }
      },
      {
        // Regex for short hand "is (not) div by".
        'regex': /^\s+(is\s+(not\s+)?div\s+by)\s+/i,
        parse: function(s, data) {
          return this.parseOperator(RegExp.$2?'div_not':'div', 'binary', 7);
        }
      },
      {
        // Regex for short hand "is (not) even/odd by".
        'regex': /^\s+is\s+(not\s+)?(even|odd)(\s+by\s+)?\s*/i,
        parse: function(s, data) {
          var op = RegExp.$1 ? ((RegExp.$2=='odd')?'even':'even_not') : ((RegExp.$2=='odd')?'even_not':'even');
          var tree = this.parseOperator(op, 'binary', 7);
          if (!RegExp.$3) {
            return tree.concat(this.parseText('1', e.tree));
          }
          return tree;
        }
      },
      {
        // Regex for AND operator.
        'regex': /^\s*(&&)\s*/,
        parse: function(s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 8);
        }
      },
      {
        // Regex for OR operator.
        'regex': /^\s*(\|\|)\s*/,
        parse: function(s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 9);
        }
      },
      {
        // Regex for AND operator.
        'regex': /^\s+and\s+/i,
        parse: function(s, data) {
          return this.parseOperator('&&', 'binary', 11);
        }
      },
      {
        // Regex for XOR operator.
        'regex': /^\s+xor\s+/i,
        parse: function(s, data) {
          return this.parseOperator('xor', 'binary', 12);
        }
      },
      {
        // Regex for OR operator.
        'regex': /^\s+or\s+/i,
        parse: function(s, data) {
          return this.parseOperator('||', 'binary', 13);
        }
      },
      {
        // Regex for config variable.
        'regex': /^#(\w+)#/,
        parse: function(s, data) {
          // TODO yet to be worked on.
          var eVar = {token:'$smarty', tree:[]};
          parseVar('.config.'+RegExp.$1, eVar, 'smarty');
          e.tree.push( eVar.tree[0] );
          parseModifiers(s, e);
        }
      },
      {
        // Regex for array.
        'regex': /^\s*\[\s*/,
        parse: function(s, data) {
          var params = this.parseParams(s, /^\s*,\s*/, /^('[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"|\w+)\s*=>\s*/);
          var tree = this.parsePluginFunc('__array', params);
          var value = params.toString();
          var paren = s.slice(params.toString().length).match(/\s*\]/);
          if (paren) {
            value += paren[0];
          }
          return {tree: tree, value: value};
        }
      },
      {
        // Regex for number.
        'regex': /^[\d.]+/,
        parse: function(s, data) {
          if (data.token.indexOf('.') > -1) {
              data.token = parseFloat(data.token);
          } else {
              data.token = parseInt(data.token, 10);
          }
          var textTree = this.parseText(data.token);
          var dataMod = this.parseModifiers(s, textTree);
          if (dataMod) {
            return dataMod.tree;
          }
          return textTree;
        }
      },
      {
        // Regex for static.
        'regex': /^\w+/,
        parse: function(s, data) {
          var textTree = this.parseText(data.token);
          var dataMod = this.parseModifiers(s, textTree);
          if (dataMod) {
            return dataMod.tree;
          }
          return textTree;
        }
      }
    ],
    buildInFunctions: {
      expression: {
        parse: function(s) {
          var data = this.parseExpression(s);
          return {
            type: 'build-in',
            name: 'expression',
            // Expression expanded inside this sub tree.
            expression: data.tree,
            params: this.parseParams(s.slice(data.value.length).replace(/^\s+|\s+$/g,'')),
          };
        }
      },
      section: {
        type: 'block',
        parse: function(params, content) {
          var subTree = [];
          var subTreeElse = [];

          var findElse = this.findElseTag('section [^}]+', '\/section', 'sectionelse', content);
          if (findElse) {
            subTree = this.parse(content.slice(0, findElse.index));
            subTreeElse = this.parse(content.slice(findElse.index+findElse[0].length).replace(/^[\r\n]/,''));
          } else {
            subTree = this.parse(content);
          }
          return {
            type: 'build-in',
            name: 'section',
            params: params,
            subTree: subTree,
            subTreeElse: subTreeElse
          };
        },
        'if': {
          type: 'block',
          parse: function(params, content) {
            var subTreeIf = [],
                subTreeElse = [];

            var findElse = this.findElseTag('if\\s+[^}]+', '\/if', 'else[^}]*', content);
            if (findElse) {
              subTreeIf = this.parse(content.slice(0, findElse.index));
              content = content.slice(findElse.index+findElse[0].length);
              var findElseIf = findElse[1].match(/^else\s*if(.*)/);
              if (findElseIf) {
                subTreeElse = this.buildInFunctions['if'].parse(this.parseParams(findElseIf[1]), content.replace(/^\n/,''));
              } else {
                subTreeElse = this.parse(content.replace(/^\n/,''));
              }
            } else {
              subTreeIf = this.parse(content);
            }
            return [{
              type: 'build-in',
              name: 'if',
              params: params,
              subTreeIf: subTreeIf,
              subTreeElse: subTreeElse
            }];
          }
        }
      }
    }
  };

  return jSmartParser;
});
