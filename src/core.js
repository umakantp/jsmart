define(['util/trimallquotes'], function (TrimAllQuotes) {
  var
      version = '@VERSION',

      // Define jsmart constructor.
      jSmart = function (template, options) {
        this.init(template, options);
      };

  // Add more properties to jSmart core.
  jSmart.prototype = {

    constructor: jSmart,

    // Current tree structure.
    tree: [],

    // Current javascript files loaded via include_javascript.
    scripts: {},

    modifiers: [],

    // All the modifiers to apply by default to all variables.
    defaultModifiers: [],

    // Filters which are applied to all variables are in 'variable'.
    // Filters which are applied after processing whole templeate are in 'post'.
    filters: {
      'variable': [],
      'post': []
    },

    // Global filters. pre, post and variable. All of them.
    filtersGlobal: {
      'pre': [],
      'variable': [],
      'post': []
    },

    // Cached value for variable filters.
    variableFilters: [],

    // Build in functions of the smarty.
    buildInFunctions: {},

    // Plugins of the functions.
    plugins: {},

    // Whether to skip tags in open brace { followed by white space(s) and close brace } with white space(s) before.
    autoLiteral: true,

    // Escape html??
    escapeHtml: false,

    // Currently disabled, will decide in future, what TODO.
    debugging: false,

    // Smarty object which has version, delimiters, config, current directory
    // and all blocks like PHP Smarty.
    smarty: {

      // Blocks in the current smarty object.
      block: {},

      // TODO:: Yet to figure out, what it is.
      'break': false,

      // All the capture blocks in the current smarty object.
      capture: {},

      // TODO:: Yet to figure out, what it is.
      'continue': false,

      // Current counter information. Smarty like feature.
      counter: {},

      // TODO:: Yet to figure out, what it is.
      cycle: {},

      // All the foreach blocks in the current smarty object.
      foreach: {},

      // All the section block in the current smarty object.
      section: {},

      // Current timestamp, when the object is created.
      now: Math.floor(((new Date()).getTime() / 1000)),

      // All the constants defined the current smarty object.
      'const': {},

      // Current configuration.
      config: {},

      // Current directory, underscored name as PHP Smarty does it.
      current_dir: '/',

      // Currrent template.
      template: '',

      // Left delimiter.
      ldelim: '{',

      // Right delimiter.
      rdelim: '}',

      // Current version of jSmart.
      version: version
    },

    // Initialize, jSmart, set settings and parse the template.
    init: function (template, options) {
      if (!options) {
        options = {};
      }
      if (options.rdelim) {
        this.smarty.rdelim = options.rdelim;
      }
      if (options.ldelim) {
        this.smarty.ldelim = options.ldelim;
      }
      if (options.autoLiteral !== undefined) {
        this.autoLiteral = options.autoLiteral;
      }

      // Is template string or at least defined?!
      template = new String(template ? template : '');
      template = this.removeComments(template);
      template = template.replace(/\r\n/g,'\n');
      template = this.applyFilters(this.filtersGlobal.pre, template);

      // Generate the tree.
      this.tree = this.parse(template);
    },

    // Common error interface.
    error: function(msg) {
      throw new Error(msg);
	  },

    // Call the filter for the content.
    applyFilters: function(filters, s) {
      for (var i=0; i<filters.length; ++i) {
        s = filters[i](s);
      }
      return s;
    },

    add: function(thingsToAdd) {
      for (var i in thingsToAdd) {
        if (thingsToAdd.hasOwnProperty(i)) {
          jSmart.prototype[i] = thingsToAdd[i];
        }
      }
    },

    // Find a first {tag} in the string.
    findTag: function(expression, s) {
      var openCount = 0,
          offset = 0,
          i,
          ldelim = this.smarty.ldelim,
          rdelim = this.smarty.rdelim,
          skipInWhitespace = this.autoLiteral,
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

    // Find closing tag which matches. expressionClose.
    findCloseTag: function(expressionClose, expressionOpen, s) {
      var sInner = ''
          closeTag = null,
          openTag = null,
          findIndex = 0;

      do {
        if (closeTag) {
          findIndex += closeTag[0].length;
        }
        closeTag = this.findTag(expressionClose, s);
        if (!closeTag) {
          this.errpr('Unclosed '+this.smarty.ldelim+expressionOpen+this.smarty.rdelim);
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
          data,
          lookUpData,
          parts = [{type: 'text', data: name}];

      for (op = s.match(expression); op; op = s.match(expression)) {
        s = s.slice(op[0].length);
        if (op[0].match(/\[/)) {
          data = this.parseExpression(s);
          if (data.tree) {
            parts.push(data.tree);
            s = s.slice(data.value.length);
          }
          var closeOp = s.match(/\s*\]/);
          if (closeOp) {
            s = s.slice(closeOp[0].length);
          }
        } else {
          var parseMod = this.parseModifiersStop;
          this.parseModifiersStop = true;
          lookUpData = this.lookUp(s, data.value);

          if (lookUpData) {
            data.tree = data.tree.concat(lookUpData.tree);
            data.value = lookUpData.value;

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

      return {s: s, tree: [{type: 'var', parts: parts}]};
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
          tree.push(this.parse(tag[0]));
          var modData = this.parseModifiers(s.slice(value.length), tree);
          return {ret: true, tree: modData.tree, value: value};
        }
      }
      anyMatchingToken = this.getMatchingToken(s);
      if (anyMatchingToken !== false) {
        value += RegExp.lastMatch;
        tree.push(this.tokens[anyMatchingToken].parse.call(this, s.slice(RegExp.lastMatch.length)));
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
          value += data.value;
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

    // Parse text.
    parseText: function (text) {
      // TODO ?? Add option to parse text inside double quotes.
      return [{type: 'text', data: text}];
    },

    // Parse the template and generate tree.
    parse: function (tpl) {
      var tree = [],
          openTag,
          tag;
      for (openTag = this.findTag('', tpl); openTag; openTag = this.findTag('', tpl))  {
        if (openTag.index) {
          tree = tree.concat(this.parseText(tpl.slice(0, openTag.index)));
        }
        tpl = tpl.slice((openTag.index + openTag[0].length));
        tag = openTag[1].match(/^\s*(\w+)(.*)$/);

        if (tag) {

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
      console.log(tree)
      return tree;
    },

    // Remove comments. We do not want to parse them anyway.
    removeComments: function (tpl) {
      var ldelim = new RegExp(this.smarty.ldelim+'\\*'),
          rdelim = new RegExp('\\*'+this.smarty.rdelim),
          newTpl = '';

      for (var openTag=tpl.match(ldelim); openTag; openTag=tpl.match(rdelim)) {
        newTpl += tpl.slice(0,openTag.index);
        s = tpl.slice(openTag.index+openTag[0].length);
        var closeTag = tpl.match(rDelim);
        if (!closeTag)
        {
          this.error('Unclosed '+this.smarty.ldelim+'*');
        }
        tpl = tpl.slice(closeTag.index+closeTag[0].length);
      }
      return newTpl + tpl;
    },

    getActualParamValues: function (params, data) {
      var actualParams = [];
      for (var name in params.__parsed) {
        if (params.__parsed.hasOwnProperty(name)) {
          var v = this.process([params.__parsed[name]], data);
          actualParams[name] = v;
        }
      }
      return actualParams;
    },

    getVarValue: function (node, data, value) {
      var v = data,
          name = '',
          i,
          part;

      for (i = 0; i < node.parts.length; ++i) {
        part = node.parts[i];
        if (part.type == 'plugin' && part.name == '__func' && part.hasOwner) {
            data.__owner = v;
            v = this.process([node.parts[i]], data);
            delete data.__owner;
        } else {
          name = this.process([part], data);

          // Set new value.
          if (value != undefined && i == (node.parts.length - 1)) {
              v[name] = value;
          }

          if (typeof v == 'object' && v !== null && name in v) {
              v = v[name];
          } else {
            if (value == undefined) {
              return value;
            }
            v[name] = {};
            v = v[name];
          }
        }
      }
      return v;
    },

    registerPlugin: function (type, name, callback) {
      if (type == 'modifier') {
        this.modifiers[name] = callback;
      } else {
        this.plugins[name] = {'type': type, 'process': callback};
      }
    },

    process: function (tree, data) {
      var res = '',
          i,
          s,
          node;

      for (i = 0; i < tree.length; ++i) {
        s = '';
        node = tree[i];
        if (node.type == 'text') {
          s = node.data;
        } else if (node.type == 'var') {
          s = this.getVarValue(node, data);
        } else if (node.type == 'build-in') {
          s = this.buildInFunctions[node.name].process.call(this, node, data);
        } else if (node.type == 'plugin') {
          var plugin = this.plugins[node.name];
          if (plugin.type == 'block') {

          } else if (plugin.type == 'function') {
            s = plugin.process(this.getActualParamValues(node.params, data), data);
          }
        }
        if (typeof s == 'boolean') {
            s = s ? '1' : '';
        }
        if (s == null) {
            s = '';
        }
        if (tree.length == 1) {
            return s;
        }
        res += s!==null ? s : '';
      }
      return res;
    },

    // Process template.
    fetch: function (data) {
      this.variableFilters = this.filtersGlobal.variable.concat(this.filters.variable);
      var res = this.process(this.tree, data);
      return res;
    }
  };

  return jSmart;
});
