/*!
 * jSmart JavaScript template engine (v3.0.0)
 * https://github.com/umakantp/jsmart
 *
 * Copyright 2011-2017, Umakant Patil <me at umakantpatil dot com>
 *                      Max Miroshnikov <miroshnikov at gmail dot com>
 * https://opensource.org/licenses/MIT
 *
 * Date: 2017-09-01T08:56Z
 */
(function (factory) {
  'use strict'

  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    // Node.js like environment. Export jSmart
    module.exports = factory()
  } else {
    if (window && window.document) {
      // Assign to browser window if window is present.
      window.jSmart = factory()
    }

    if (typeof define === 'function' && define.amd) {
      // Require js is present? Lets define module.
      define('jSmart', [], factory)
    }
  }
// Pass this if window is not defined yet
})(function () {
  'use strict'

  


  function objectMerge (ob1, ob2 /* , ... */) {
    for (var i = 1; i < arguments.length; ++i) {
      for (var name in arguments[i]) {
        ob1[name] = arguments[i][name]
      }
    }
    return ob1
  }


  function evalString (s) {
    return s.replace(/\\t/, '\t').replace(/\\n/, '\n').replace(/\\(['"\\])/g, '$1')
  }


  // Trim all quotes.
  function trimAllQuotes (s) {
    return evalString(s.replace(/^['"](.*)['"]$/, '$1')).replace(/^\s+|\s+$/g, '')
  }


  // Find in array.
  function findInArray (arr, val) {
    if (Array.prototype.indexOf) {
      return arr.indexOf(val)
    }
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === val) {
        return i
      }
    }
    return -1
  }
// Parser object. Plain object which just does parsing.
  var jSmartParser = {

    // Cached templates.
    files: {},

    // Default left delimiter.
    ldelim: '{',

    // Default right delimiter.
    rdelim: '}',

    // Default auto literal value.
    autoLiteral: true,

    // Store runtime generated runtime plugins.
    runTimePlugins: {},

    // Plugins function to use for parsing.
    // They are added later from jSmart, so we need a copy here.
    plugins: {},

    // Listing down all pre filters, before processing a template.
    preFilters: [],

    getTemplate: function (name) {
      throw new Error('no getTemplate function defined.')
    },

    clear: function () {
      // Clean up config, specific for this parsing.
      this.runTimePlugins = {}
      this.preFilters = []
      this.autoLiteral = true
      this.plugins = {}
      this.ldelim = '{'
      this.rdelim = '}'
    },

    // Parse the template and return the data.
    getParsed: function (template) {
      var tree = []
      var runTimePlugins
      // Remove comments, we never want them.
      template = this.removeComments(template)
      // Make use of linux new comments. It will be consistent across all templates.
      template = template.replace(/\r\n/g, '\n')
      // Apply global pre filters to the template. These are global filters,
      // so we take it from global object, rather than taking it as args to
      // "new jSmart()" object.
      template = this.applyFilters(this.preFilters, template)

      // Parse the template and get the output.
      tree = this.parse(template)
      // console.log(tree);

      // Copy so far runtime plugins were generated.
      runTimePlugins = this.runTimePlugins

      this.clear()
      // Nope, we do not want to clear the cache.
      // Refactor to maintain cache. Until that keep commented.
      // this.files = {};
      return {tree: tree, runTimePlugins: runTimePlugins}
    },

    // Parse the template and generate tree.
    parse: function (tpl) {
      var tree = []
      var openTag
      var tag
      var name
      var paramStr
      var node
      var closeTag

      for (openTag = this.findTag('', tpl); openTag; openTag = this.findTag('', tpl)) {
        if (openTag.index) {
          tree = tree.concat(this.parseText(tpl.slice(0, openTag.index)))
        }
        tpl = tpl.slice((openTag.index + openTag[0].length))
        tag = openTag[1].match(/^\s*(\w+)(.*)$/)
        if (tag) {
          // Function?!
          name = tag[1]
          paramStr = (tag.length > 2) ? tag[2].replace(/^\s+|\s+$/g, '') : ''
          if (name in this.buildInFunctions) {
            var buildIn = this.buildInFunctions[name]
            var params = ('parseParams' in buildIn ? buildIn.parseParams.bind(this) : this.parseParams.bind(this))(paramStr)
            if (buildIn.type === 'block') {
              // Remove new line after block open tag (like in Smarty)
              tpl = tpl.replace(/^\n/, '')
              closeTag = this.findCloseTag('/' + name, name + ' +[^}]*', tpl)
              var functionTree = buildIn.parse.call(this, params, tpl.slice(0, closeTag.index))
              if (functionTree) {
                // Some functions return false like {php} and {function}
                tree = tree.concat(functionTree)
              }
              tpl = tpl.slice(closeTag.index + closeTag[0].length)
            } else {
              if (name === 'extends') {
                // Anything before {extends} should be stripped.
                tree.splice(0, tree.length)
              }
              tree = tree.concat(buildIn.parse.call(this, params))
              if (name === 'extends') {
                // TODO:: How to implement this?
                // tree = []; Throw away further parsing except for {block}
              }
            }
            tpl = tpl.replace(/^\n/, '')
          } else if (name in this.runTimePlugins) {
            // Possible it is function name. give it a priority before plugin.
            tree = tree.concat(this.parsePluginFunc(name, this.parseParams(paramStr)))
          } else if (name in this.plugins) {
            var plugin = this.plugins[name]
            if (plugin.type === 'block') {
              closeTag = this.findCloseTag('/' + name, name + ' +[^}]*', tpl)
              tree = tree.concat(this.parsePluginBlock(name, this.parseParams(paramStr), tpl.slice(0, closeTag.index)))
              tpl = tpl.slice(closeTag.index + closeTag[0].length)
            } else if (plugin.type === 'function') {
              tree = tree.concat(this.parsePluginFunc(name, this.parseParams(paramStr)))
            }
            if (name === 'append' || name === 'assign' || name === 'capture' || name === 'eval' || name === 'include') {
              tpl = tpl.replace(/^\n/, '')
            }
          } else {
            // Variable.
            node = this.buildInFunctions.expression.parse.call(this, openTag[1])
            tree.push(node)
          }
        } else {
          // Variable.
          node = this.buildInFunctions.expression.parse.call(this, openTag[1])
          if (node.expression.type === 'build-in' && node.expression.name === 'operator' && node.expression.op === '=') {
            tpl = tpl.replace(/^\n/, '')
          }
          tree.push(node)
        }
      }
      if (tpl) {
        tree = tree.concat(this.parseText(tpl))
      }
      return tree
    },

    // Find a first {tag} in the string.
    findTag: function (expression, s) {
      var openCount = 0
      var offset = 0
      var i
      var ldelim = this.ldelim
      var rdelim = this.rdelim
      var skipInWhitespace = this.autoLiteral
      var expressionAny = /^\s*(.+)\s*$/i
      var expressionTag = expression ? new RegExp('^\\s*(' + expression + ')\\s*$', 'i') : expressionAny
      var sTag
      var found

      for (i = 0; i < s.length; ++i) {
        if (s.substr(i, ldelim.length) === ldelim) {
          if (skipInWhitespace && (i + 1) < s.length && s.substr((i + 1), 1).match(/\s/)) {
            continue
          }
          if (!openCount) {
            s = s.slice(i)
            offset += parseInt(i)
            i = 0
          }
          ++openCount
        } else if (s.substr(i, rdelim.length) === rdelim) {
          if (skipInWhitespace && (i - 1) >= 0 && s.substr((i - 1), 1).match(/\s/)) {
            continue
          }
          if (!--openCount) {
            sTag = s.slice(ldelim.length, i).replace(/[\r\n]/g, ' ')
            found = sTag.match(expressionTag)
            if (found) {
              found.index = offset
              found[0] = s.slice(0, (i + rdelim.length))
              return found
            }
          }
          if (openCount < 0) {
            // Ignore any number of unmatched right delimiters.
            openCount = 0
          }
        }
      }
      return null
    },

    findElseTag: function (reOpen, reClose, reElse, s) {
      var offset = 0

      for (var elseTag = this.findTag(reElse, s); elseTag; elseTag = this.findTag(reElse, s)) {
        var openTag = this.findTag(reOpen, s)
        if (!openTag || openTag.index > elseTag.index) {
          elseTag.index += offset
          return elseTag
        } else {
          s = s.slice(openTag.index + openTag[0].length)
          offset += openTag.index + openTag[0].length
          var closeTag = this.findCloseTag(reClose, reOpen, s)
          s = s.slice(closeTag.index + closeTag[0].length)
          offset += closeTag.index + closeTag[0].length
        }
      }
      return null
    },

    // Find closing tag which matches. expressionClose.
    findCloseTag: function (expressionClose, expressionOpen, s) {
      var sInner = ''
      var closeTag = null
      var openTag = null
      var findIndex = 0

      do {
        if (closeTag) {
          findIndex += closeTag[0].length
        }
        closeTag = this.findTag(expressionClose, s)
        if (!closeTag) {
          throw new Error('Unclosed ' + this.ldelim + expressionOpen + this.rdelim)
        }
        sInner += s.slice(0, closeTag.index)
        findIndex += closeTag.index
        s = s.slice((closeTag.index + closeTag[0].length))
        openTag = this.findTag(expressionOpen, sInner)
        if (openTag) {
          sInner = sInner.slice((openTag.index + openTag[0].length))
        }
      } while (openTag)

      closeTag.index = findIndex
      return closeTag
    },

    bundleOp: function (i, tree, precedence) {
      var op = tree[i]
      if (op.name === 'operator' && op.precedence === precedence && !op.params.__parsed) {
        if (op.optype === 'binary') {
          op.params.__parsed = [tree[(i - 1)], tree[(i + 1)]]
          tree.splice((i - 1), 3, op)
          return [true, tree]
        } else if (op.optype === 'post-unary') {
          op.params.__parsed = [tree[(i - 1)]]
          tree.splice((i - 1), 2, op)
          return [true, tree]
        }

        op.params.__parsed = [tree[(i + 1)]]
        tree.splice(i, 2, op)
      }
      return [false, tree]
    },

    composeExpression: function (tree) {
      var i = 0
      var data

      for (i = 0; i < tree.length; ++i) {
        if (tree[i] instanceof Array) {
          tree[i] = this.composeExpression(tree[i])
        }
      }

      for (var precedence = 1; precedence < 14; ++precedence) {
        if (precedence === 2 || precedence === 10) {
          for (i = tree.length; i > 0; --i) {
            data = this.bundleOp(i - 1, tree, precedence)
            i -= data[0]
            tree = data[1]
          }
        } else {
          for (i = 0; i < tree.length; ++i) {
            data = this.bundleOp(i, tree, precedence)
            i -= data[0]
            tree = data[1]
          }
        }
      }
      // Only one node should be left.
      return tree[0]
    },

    getMatchingToken: function (s) {
      for (var i = 0; i < this.tokens.length; ++i) {
        if (s.match(this.tokens[i].regex)) {
          return i
        }
      }
      return false
    },

    parseVar: function (s, name, token) {
      var expression = /^(?:\.|\s*->\s*|\[\s*)/
      var op
      var data = {value: '', tree: []}
      var lookUpData
      var value = ''
      var parts = [{type: 'text', data: name}]
      var rootName = token

      if (!token) {
        token = name
        rootName = token
      }
      for (op = s.match(expression); op; op = s.match(expression)) {
        token += op[0]
        s = s.slice(op[0].length)
        if (op[0].match(/\[/)) {
          data = this.parseExpression(s, true)
          if (data.tree) {
            token += data.value
            parts.push(data.tree)
            s = s.slice(data.value.length)
          }
          var closeOp = s.match(/\s*\]/)
          if (closeOp) {
            token += closeOp[0]
            s = s.slice(closeOp[0].length)
          }
        } else {
          var parseMod = this.parseModifiersStop
          this.parseModifiersStop = true
          lookUpData = this.lookUp(s, '')
          if (lookUpData) {
            data.tree = [].concat(data.tree, lookUpData.tree)
            data.value = lookUpData.value
            token += lookUpData.value

            if (lookUpData.ret) {
              var part = data.tree[(data.tree.length - 1)]
              if (part.type === 'plugin' && part.name === '__func') {
                part.hasOwner = true
              }
              parts.push(part)
              s = s.slice(data.value.length)
            } else {
              data = false
            }
          }
          this.parseModifiersStop = parseMod
        }
        if (!data) {
          parts.push({type: 'text', data: ''})
        }
      }
      value = token.substr(rootName.length)

      return {s: s, token: token, tree: [{type: 'var', parts: parts}], value: value}
    },

    parseFunc: function (name, params, tree) {
      params.__parsed.name = this.parseText(name, [])[0]
      tree.push({
        type: 'plugin',
        name: '__func',
        params: params
      })
      return tree
    },

    parseOperator: function (op, type, precedence) {
      return [{
        type: 'build-in',
        name: 'operator',
        op: op,
        optype: type,
        precedence: precedence,
        params: {}
      }]
    },

    parsePluginBlock: function (name, params, content) {
      return [{
        type: 'plugin',
        name: name,
        params: params,
        subTree: this.parse(content, [])
      }]
    },

    parsePluginFunc: function (name, params) {
      return [{
        type: 'plugin',
        name: name,
        params: params
      }]
    },

    parseModifiers: function (s, tree) {
      var modifier = s.match(/^\|(\w+)/)
      var value = ''
      var funcName
      if (this.parseModifiersStop) {
        return
      }
      if (!modifier) {
        return
      }
      value += modifier[0]

      funcName = ((modifier[1] === 'default') ? 'defaultValue' : modifier[1])
      s = s.slice(modifier[0].length).replace(/^\s+/, '')

      this.parseModifiersStop = true
      var params = []
      for (var colon = s.match(/^\s*:\s*/); colon; colon = s.match(/^\s*:\s*/)) {
        value += s.slice(0, colon[0].length)
        s = s.slice(colon[0].length)
        var lookUpData = this.lookUp(s, '')
        if (lookUpData.ret) {
          value += lookUpData.value
          params.push(lookUpData.tree[0])
          s = s.slice(lookUpData.value.length)
        } else {
          params.push(this.parseText(''))
        }
      }
      this.parseModifiersStop = false

      // Modifiers have the highest priority.
      params.unshift(tree.pop())
      var funcData = this.parseFunc(funcName, {__parsed: params}, [])
      tree.push(funcData[0])

      // Modifiers can be combined.
      var selfData = this.parseModifiers(s, tree)
      // If data is returned merge the current tree and tree we got.
      if (selfData) {
        tree = tree.concat(selfData.tree)
      }
      return {value: value, tree: tree}
    },

    parseParams: function (paramsStr, regexDelim, regexName) {
      var s = paramsStr.replace(/\n/g, ' ').replace(/^\s+|\s+$/g, '')
      var params = []
      paramsStr = ''

      params.__parsed = []

      if (!s) {
        return params
      }

      if (!regexDelim) {
        regexDelim = /^\s+/
        regexName = /^(\w+)\s*=\s*/
      }

      while (s) {
        var name = null
        if (regexName) {
          var foundName = s.match(regexName)
          if (foundName) {
            var firstChar = foundName[1].charAt(0).match(/^\d+/)
            if (foundName[1] === 'true' || foundName[1] === 'false' || foundName[1] === 'null') {
              firstChar = true
            }

            if (!firstChar) {
              name = trimAllQuotes(foundName[1])
              paramsStr += s.slice(0, foundName[0].length)
              s = s.slice(foundName[0].length)
            }
          }
        }

        var param = this.parseExpression(s)
        if (!param) {
          break
        }

        if (name) {
          params[name] = param.value
          params.__parsed[name] = param.tree
        } else {
          params.push(param.value)
          params.__parsed.push(param.tree)
        }

        paramsStr += s.slice(0, param.value.length)
        s = s.slice(param.value.length)

        var foundDelim = s.match(regexDelim)
        if (foundDelim) {
          paramsStr += s.slice(0, foundDelim[0].length)
          s = s.slice(foundDelim[0].length)
        } else {
          break
        }
      }
      params.toString = function () {
        return paramsStr
      }
      return params
    },

    lookUp: function (s, value) {
      var tree = []
      var tag

      if (!s) {
        return false
      }
      if (s.substr(0, this.ldelim.length) === this.ldelim) {
        tag = this.findTag('', s)
        value += tag[0]
        if (tag) {
          var t = this.parse(tag[0])
          tree = tree.concat(t)
          var modData = this.parseModifiers(s.slice(value.length), tree)
          if (modData) {
            return {ret: true, tree: modData.tree, value: modData.value}
          }
          return {ret: true, tree: tree, value: value}
        }
      }

      var anyMatchingToken = this.getMatchingToken(s)
      if (anyMatchingToken !== false) {
        value += RegExp.lastMatch
        var newTree = this.tokens[anyMatchingToken].parse.call(this, s.slice(RegExp.lastMatch.length), {tree: tree, token: RegExp.lastMatch})

        if (typeof newTree === 'string') {
          if (newTree === 'parenStart') {
            var blankTree = []
            tree.push(blankTree)
            blankTree.parent = tree
            tree = blankTree
          } else if (newTree === 'parenEnd') {
            if (tree.parent) {
              tree = tree.parent
            }
          }
        } else if ((!!newTree) && (newTree.constructor === Object)) {
          // TODO :: figure out, how we would we get this done by
          // only getting tree (no value should be needed.)
          value += newTree.value
          newTree = newTree.tree
          tree = tree.concat(newTree)
        } else {
          tree = tree.concat(newTree)
        }
        return {ret: true, tree: tree, value: value}
      }
      return {ret: false, tree: tree, value: value}
    },

    // Parse expression.
    parseExpression: function (s) {
      var tree = []
      var value = ''
      var data

      // TODO Refactor, to get this removed.
      this.lastTreeInExpression = tree
      while (true) {
        data = this.lookUp(s.slice(value.length), value)
        if (data) {
          tree = tree.concat(data.tree)
          value = data.value
          this.lastTreeInExpression = tree
          if (!data.ret) {
            break
          }
        } else {
          break
        }
      }
      if (tree.length) {
        tree = this.composeExpression(tree)
      }

      return {tree: tree, value: value}
    },

    // Parse boolean.
    parseBool: function (boolVal) {
      return [{type: 'boolean', data: boolVal}]
    },

    // Parse text.
    parseText: function (text) {
      var tree = []

      if (this.parseEmbeddedVars) {
        var re = /([$][\w@]+)|`([^`]*)`/
        for (var found = re.exec(text); found; found = re.exec(text)) {
          tree.push({type: 'text', data: text.slice(0, found.index)})
          var d = this.parseExpression(found[1] ? found[1] : found[2])
          tree.push(d.tree)
          text = text.slice(found.index + found[0].length)
        }
      }
      tree.push({type: 'text', data: text})
      return tree
    },

    loadTemplate: function (name, nocache) {
      var tree = []
      if (nocache || !(name in this.files)) {
        var tpl = this.getTemplate(name)
        if (typeof tpl !== 'string') {
          throw new Error('No template for ' + name)
        }
        // TODO:: Duplicate code like getParsed. Refactor.
        tpl = this.removeComments(tpl.replace(/\r\n/g, '\n'))
        tpl = this.applyFilters(this.preFilters, tpl)
        tree = this.parse(tpl)
        this.files[name] = tree
      } else {
        tree = this.files[name]
      }
      return tree
    },

    // Remove comments. We do not want to parse them anyway.
    removeComments: function (tpl) {
      var ldelim = new RegExp(this.ldelim + '\\*')
      var rdelim = new RegExp('\\*' + this.rdelim)
      var newTpl = ''

      for (var openTag = tpl.match(ldelim); openTag; openTag = tpl.match(rdelim)) {
        newTpl += tpl.slice(0, openTag.index)
        tpl = tpl.slice(openTag.index + openTag[0].length)
        var closeTag = tpl.match(rdelim)
        if (!closeTag) {
          throw new Error('Unclosed ' + ldelim + '*')
        }
        tpl = tpl.slice(closeTag.index + closeTag[0].length)
      }
      return newTpl + tpl
    },

    // TODO:: Remove this duplicate function.
    // Apply the filters to template.
    applyFilters: function (filters, tpl) {
      for (var i = 0; i < filters.length; ++i) {
        tpl = filters[i](tpl)
      }
      return tpl
    },

    // Tokens to indentify data inside template.
    tokens: [
      {
        // Token for variable.
        'regex': /^\$([\w@]+)/,
        parse: function (s, data) {
          var dataVar = this.parseVar(s, RegExp.$1, RegExp.$1)
          var dataMod = this.parseModifiers(dataVar.s, dataVar.tree)
          if (dataMod) {
            dataVar.value += dataMod.value
            return dataMod
          }
          return dataVar
        }
      },
      {
        // Token for boolean.
        'regex': /^(true|false)/i,
        parse: function (s, data) {
          if (data.token.match(/true/i)) {
            return this.parseBool(true)
          }
          return this.parseBool(false)
        }
      },
      {
        // Token for to grab data inside single quotes.
        'regex': /^'([^'\\]*(?:\\.[^'\\]*)*)'/,
        parse: function (s, data) {
          // Data inside single quote is like string, we do not parse it.
          var regexStr = evalString(RegExp.$1)
          var textTree = this.parseText(regexStr)
          var dataMod = this.parseModifiers(s, textTree)
          if (dataMod) {
            return dataMod
          }
          return textTree
        }
      },
      {
        // Token for to grab data inside double quotes.
        // We parse data inside double quotes.
        'regex': /^"([^"\\]*(?:\\.[^"\\]*)*)"/,
        parse: function (s, data) {
          var v = evalString(RegExp.$1)
          var isVar = v.match(this.tokens[0]['regex'])
          if (isVar) {
            var newData = this.parseVar(v, isVar[1], isVar[0])
            if (newData.token.length === v.length) {
              return [newData.tree[0]]
            }
          }
          this.parseEmbeddedVars = true
          var tree = []
          tree.push({
            type: 'plugin',
            name: '__quoted',
            params: {__parsed: this.parse(v, [])}
          })
          this.parseEmbeddedVars = false
          var modData = this.parseModifiers(s, tree)
          if (modData) {
            return modData
          }
          return tree
        }
      },
      {
        // Token for func().
        'regex': /^(\w+)\s*[(]([)]?)/,
        parse: function (s, data) {
          var funcName = RegExp.$1
          var noArgs = RegExp.$2
          var params = this.parseParams(((noArgs) ? '' : s), /^\s*,\s*/)
          var tree = this.parseFunc(funcName, params, [])
          // var value += params.toString();
          var dataMod = this.parseModifiers(s.slice(params.toString().length), tree)
          if (dataMod) {
            return dataMod
          }
          return tree
        }
      },
      {
        // Token for expression in parentheses.
        'regex': /^\s*\(\s*/,
        parse: function (s, data) {
          // We do not know way of manupilating the tree here.
          return 'parenStart'
        }
      },
      {
        // Token for end of func() or (expr).
        'regex': /^\s*\)\s*/,
        parse: function (s, data) {
          // We do not know way of manupilating the tree here.
          return 'parenEnd'
        }
      },
      {
        // Token for increment operator.
        'regex': /^\s*(\+\+|--)\s*/,
        parse: function (s, data) {
          if (this.lastTreeInExpression.length && this.lastTreeInExpression[this.lastTreeInExpression.length - 1].type === 'var') {
            return this.parseOperator(RegExp.$1, 'post-unary', 1)
          } else {
            return this.parseOperator(RegExp.$1, 'pre-unary', 1)
          }
        }
      },
      {
        // Regex for strict equal, strict not equal, equal and not equal operator.
        'regex': /^\s*(===|!==|==|!=)\s*/,
        parse: function (s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 6)
        }
      },
      {
        // Regex for equal, not equal operator.
        'regex': /^\s+(eq|ne|neq)\s+/i,
        parse: function (s, data) {
          var op = RegExp.$1.replace(/ne(q)?/, '!=').replace(/eq/, '==')
          return this.parseOperator(op, 'binary', 6)
        }
      },
      {
        // Regex for NOT operator.
        'regex': /^\s*!\s*/,
        parse: function (s, data) {
          return this.parseOperator('!', 'pre-unary', 2)
        }
      },
      {
        // Regex for NOT operator.
        'regex': /^\s+not\s+/i,
        parse: function (s, data) {
          return this.parseOperator('!', 'pre-unary', 2)
        }
      },
      {
        // Regex for =, +=, *=, /=, %= operator.
        'regex': /^\s*(=|\+=|-=|\*=|\/=|%=)\s*/,
        parse: function (s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 10)
        }
      },
      {
        // Regex for *, /, % binary operator.
        'regex': /^\s*(\*|\/|%)\s*/,
        parse: function (s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 3)
        }
      },
      {
        // Regex for mod operator.
        'regex': /^\s+mod\s+/i,
        parse: function (s, data) {
          return this.parseOperator('%', 'binary', 3)
        }
      },
      {
        // Regex for +/- operator.
        'regex': /^\s*(\+|-)\s*/,
        parse: function (s, data) {
          if (!this.lastTreeInExpression.length || this.lastTreeInExpression[this.lastTreeInExpression.length - 1].name === 'operator') {
            return this.parseOperator(RegExp.$1, 'pre-unary', 4)
          } else {
            return this.parseOperator(RegExp.$1, 'binary', 4)
          }
        }
      },
      {
        // Regex for less than, greater than, less than equal, reather than equal.
        'regex': /^\s*(<=|>=|<>|<|>)\s*/,
        parse: function (s, data) {
          return this.parseOperator(RegExp.$1.replace(/<>/, '!='), 'binary', 5)
        }
      },
      {
        // Regex for less than, greater than, less than equal, reather than equal.
        'regex': /^\s+(lt|lte|le|gt|gte|ge)\s+/i,
        parse: function (s, data) {
          var op = RegExp.$1.replace(/l(t)?e/, '<').replace(/lt/, '<=').replace(/g(t)?e/, '>').replace(/gt/, '>=')
          return this.parseOperator(op, 'binary', 5)
        }
      },
      {
        // Regex for short hand "is (not) div by".
        'regex': /^\s+(is\s+(not\s+)?div\s+by)\s+/i,
        parse: function (s, data) {
          return this.parseOperator(RegExp.$2 ? 'div_not' : 'div', 'binary', 7)
        }
      },
      {
        // Regex for short hand "is (not) even/odd by".
        'regex': /^\s+is\s+(not\s+)?(even|odd)(\s+by\s+)?\s*/i,
        parse: function (s, data) {
          var op = RegExp.$1 ? ((RegExp.$2 === 'odd') ? 'even' : 'even_not') : ((RegExp.$2 === 'odd') ? 'even_not' : 'even')
          var tree = this.parseOperator(op, 'binary', 7)
          if (!RegExp.$3) {
            return tree.concat(this.parseText('1', tree))
          }
          return tree
        }
      },
      {
        // Regex for AND operator.
        'regex': /^\s*(&&)\s*/,
        parse: function (s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 8)
        }
      },
      {
        // Regex for OR operator.
        'regex': /^\s*(\|\|)\s*/,
        parse: function (s, data) {
          return this.parseOperator(RegExp.$1, 'binary', 9)
        }
      },
      {
        // Regex for AND operator.
        'regex': /^\s+and\s+/i,
        parse: function (s, data) {
          return this.parseOperator('&&', 'binary', 11)
        }
      },
      {
        // Regex for XOR operator.
        'regex': /^\s+xor\s+/i,
        parse: function (s, data) {
          return this.parseOperator('xor', 'binary', 12)
        }
      },
      {
        // Regex for OR operator.
        'regex': /^\s+or\s+/i,
        parse: function (s, data) {
          return this.parseOperator('||', 'binary', 13)
        }
      },
      {
        // Regex for config variable.
        'regex': /^#(\w+)#/,
        parse: function (s, data) {
          // TODO yet to be worked on
          var e
          var eVar = {token: '$smarty', tree: []}
          this.parseVar('.config.' + RegExp.$1, eVar, 'smarty')
          e.tree.push(eVar.tree[0])
          this.parseModifiers(s, e)
        }
      },
      {
        // Regex for array.
        'regex': /^\s*\[\s*/,
        parse: function (s, data) {
          var params = this.parseParams(s, /^\s*,\s*/, /^('[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"|\w+)\s*=>\s*/)
          var tree = this.parsePluginFunc('__array', params)
          var value = params.toString()
          var paren = s.slice(params.toString().length).match(/\s*\]/)
          if (paren) {
            value += paren[0]
          }
          return {tree: tree, value: value}
        }
      },
      {
        // Regex for number.
        'regex': /^[\d.]+/,
        parse: function (s, data) {
          if (data.token.indexOf('.') > -1) {
            data.token = parseFloat(data.token)
          } else {
            data.token = parseInt(data.token, 10)
          }
          var textTree = this.parseText(data.token)
          var dataMod = this.parseModifiers(s, textTree)
          if (dataMod) {
            return dataMod
          }
          return textTree
        }
      },
      {
        // Regex for static.
        'regex': /^\w+/,
        parse: function (s, data) {
          var textTree = this.parseText(data.token)
          var dataMod = this.parseModifiers(s, textTree)
          if (dataMod) {
            return dataMod
          }
          return textTree
        }
      }
    ],
    buildInFunctions: {
      expression: {
        parse: function (s) {
          var data = this.parseExpression(s)

          return {
            type: 'build-in',
            name: 'expression',
            // Expression expanded inside this sub tree.
            expression: data.tree,
            params: this.parseParams(s.slice(data.value.length).replace(/^\s+|\s+$/g, ''))
          }
        }
      },
      section: {
        type: 'block',
        parse: function (params, content) {
          var subTree = []
          var subTreeElse = []

          var findElse = this.findElseTag('section [^}]+', '/section', 'sectionelse', content)
          if (findElse) {
            subTree = this.parse(content.slice(0, findElse.index))
            subTreeElse = this.parse(content.slice(findElse.index + findElse[0].length).replace(/^[\r\n]/, ''))
          } else {
            subTree = this.parse(content)
          }
          return {
            type: 'build-in',
            name: 'section',
            params: params,
            subTree: subTree,
            subTreeElse: subTreeElse
          }
        }
      },

      setfilter: {
        type: 'block',
        parseParams: function (paramStr) {
          return [this.parseExpression('__t()|' + paramStr).tree]
        },
        parse: function (params, content) {
          return {
            type: 'build-in',
            name: 'setfilter',
            params: params,
            subTree: this.parse(content)
          }
        }
      },

      append: {
        'type': 'function',
        parse: function (params) {
          return {
            type: 'build-in',
            name: 'append',
            params: params
          }
        }
      },

      assign: {
        'type': 'function',
        parse: function (params) {
          return {
            type: 'build-in',
            name: 'assign',
            params: params
          }
        }
      },

      'call': {
        'type': 'function',
        parse: function (params) {
          return {
            type: 'build-in',
            name: 'call',
            params: params
          }
        }
      },

      capture: {
        'type': 'block',
        parse: function (params, content) {
          var tree = this.parse(content)
          return {
            type: 'build-in',
            name: 'capture',
            params: params,
            subTree: tree
          }
        }
      },

      nocache: {
        'type': 'block',
        parse: function (params, content) {
          var tree = this.parse(content)
          return {
            type: 'build-in',
            name: 'nocache',
            params: params,
            subTree: tree
          }
        }
      },

      include: {
        'type': 'function',
        parse: function (params) {
          var file = trimAllQuotes(params.file ? params.file : params[0])
          var nocache = (findInArray(params, 'nocache') >= 0)
          var tree = this.loadTemplate(file, nocache)

          return {
            type: 'build-in',
            name: 'include',
            params: params,
            subTree: tree
          }
        }
      },

      'for': {
        type: 'block',
        parseParams: function (paramStr) {
          var res = paramStr.match(/^\s*\$(\w+)\s*=\s*([^\s]+)\s*to\s*([^\s]+)\s*(?:step\s*([^\s]+))?\s*(.*)$/)
          if (!res) {
            throw new Error('Invalid {for} parameters: ' + paramStr)
          }
          return this.parseParams("varName='" + res[1] + "' from=" + res[2] + ' to=' + res[3] + ' step=' + (res[4] ? res[4] : '1') + ' ' + res[5])
        },
        parse: function (params, content) {
          var subTree = []
          var subTreeElse = []

          var findElse = this.findElseTag('for\\s[^}]+', '/for', 'forelse', content)
          if (findElse) {
            subTree = this.parse(content.slice(0, findElse.index))
            subTreeElse = this.parse(content.slice(findElse.index + findElse[0].length))
          } else {
            subTree = this.parse(content)
          }
          return {
            type: 'build-in',
            name: 'for',
            params: params,
            subTree: subTree,
            subTreeElse: subTreeElse
          }
        }
      },

      'if': {
        type: 'block',
        parse: function (params, content) {
          var subTreeIf = []
          var subTreeElse = []
          var findElse = this.findElseTag('if\\s+[^}]+', '/if', 'else[^}]*', content)

          if (findElse) {
            subTreeIf = this.parse(content.slice(0, findElse.index))
            content = content.slice(findElse.index + findElse[0].length)
            var findElseIf = findElse[1].match(/^else\s*if(.*)/)
            if (findElseIf) {
              subTreeElse = this.buildInFunctions['if'].parse.call(this, this.parseParams(findElseIf[1]), content.replace(/^\n/, ''))
            } else {
              subTreeElse = this.parse(content.replace(/^\n/, ''))
            }
          } else {
            subTreeIf = this.parse(content)
          }
          return [{
            type: 'build-in',
            name: 'if',
            params: params,
            subTreeIf: subTreeIf,
            subTreeElse: subTreeElse
          }]
        }
      },

      counter: {
        type: 'function',
        parse: function (params) {
          return {
            type: 'build-in',
            name: 'counter',
            params: params
          }
        }
      },

      'foreach': {
        type: 'block',
        parseParams: function (paramStr) {
          var res = paramStr.match(/^\s*([$].+)\s*as\s*[$](\w+)\s*(=>\s*[$](\w+))?\s*$/i)
          // Smarty 3.x syntax => Smarty 2.x syntax
          if (res) {
            paramStr = 'from=' + res[1] + ' item=' + (res[4] || res[2])
            if (res[4]) {
              paramStr += ' key=' + res[2]
            }
          }
          return this.parseParams(paramStr)
        },
        parse: function (params, content) {
          var subTree = []
          var subTreeElse = []

          var findElse = this.findElseTag('foreach\\s[^}]+', '/foreach', 'foreachelse', content)
          if (findElse) {
            subTree = this.parse(content.slice(0, findElse.index))
            subTreeElse = this.parse(content.slice(findElse.index + findElse[0].length).replace(/^[\r\n]/, ''))
          } else {
            subTree = this.parse(content)
          }
          return {
            type: 'build-in',
            name: 'foreach',
            params: params,
            subTree: subTree,
            subTreeElse: subTreeElse
          }
        }
      },

      'function': {
        type: 'block',
        parse: function (params, content) {
          /* It is the case where we generate tree and keep it aside
           to be used when called.
           Keep it as runtime plugin is a better choice.
          */
          // Right now, just add a name of plugin in run time, so when we parse
          // the content inside function and it uses name of same other run time
          // plugin. it has to be found. Value for it a true, just to make sure it exists.
          this.runTimePlugins[trimAllQuotes(params.name ? params.name : params[0])] = true

          var tree = this.parse(content)
          // We have a tree, now we need to add it to runtime plugins list.
          // Let us store it as local plugin and end of parsing
          // we pass it to original jSmart object.
          this.runTimePlugins[trimAllQuotes(params.name ? params.name : params[0])] = {
            tree: tree,
            defaultParams: params
          }
          // Do not take this in tree. Skip it.
          return false
        }
      },

      // If someone has used {php} tags, we ignore that tag.
      // Do not want to post errors.
      php: {
        type: 'block',
        parse: function (params, content) {
          // Do not take this in tree. Skip it.
          return false
        }
      },

      'extends': {
        type: 'function',
        parse: function (params) {
          return this.loadTemplate(trimAllQuotes(((params.file) ? params.file : params[0])))
        }
      },

      strip: {
        type: 'block',
        parse: function (params, content) {
          return this.parse(content.replace(/[ \t]*[\r\n]+[ \t]*/g, ''))
        }
      },

      literal: {
        type: 'block',
        parse: function (params, content) {
          return this.parseText(content)
        }
      },

      ldelim: {
        type: 'function',
        parse: function (params) {
          return this.parseText(this.ldelim)
        }
      },

      rdelim: {
        type: 'function',
        parse: function (params) {
          return this.parseText(this.rdelim)
        }
      },

      'while': {
        type: 'block',
        parse: function (params, content) {
          return {
            type: 'build-in',
            name: 'while',
            params: params,
            subTree: this.parse(content)
          }
        }
      }
    }
  }


  /**
   * Returns boolean true if object is empty otherwise false.
   *
   * @param object hash Object you are testing against.
   *
   * @return boolean
   */
  function isEmptyObject (hash) {
    for (var i in hash) {
      if (hash.hasOwnProperty(i)) {
        return false
      }
    }
    return true
  }


  function countProperties (ob) {
    var count = 0
    for (var name in ob) {
      if (ob.hasOwnProperty(name)) {
        count++
      }
    }
    return count
  }
// Processor object. Plain object which just does processing.
  var jSmartProcessor = {

    // Variable set temporary for processing.
    tplModifiers: [],

    // Store run time plugins.
    runTimePlugins: {},

    // Plugins function to use for processing.
    // They are added later from jSmart, so we need a copy here.
    plugins: {},

    // Modifiers function to use for processing.
    // They are added later from jSmart, so we need a copy here.
    modifiers: {},

    // Variable modifiers default to be applied.
    defaultModifiers: {},

    // If to escape html?.
    escapeHtml: false,

    // All filters for variable to run.
    variableFilters: [],

    clear: function () {
      // Clean up config, specific for this processing.
      this.runTimePlugins = {}
      this.variableFilters = []
      this.escapeHtml = false
      this.defaultModifiers = {}
      this.modifiers = {}
      this.plugins = {}
    },

    // Process the tree and return the data.
    getProcessed: function (tree, data) {
      // Process the tree and get the output.
      var output = this.process(tree, data)
      this.clear()

      return {
        output: output.tpl,
        smarty: output.smarty
      }
    },

    // Process the tree and apply data.
    process: function (tree, data) {
      var res = ''
      var s
      var node
      var tmp
      var plugin

      for (var i = 0; i < tree.length; ++i) {
        node = tree[i]
        s = ''

        if (node.type === 'text') {
          s = node.data
        } else if (node.type === 'var') {
          s = this.getVarValue(node, data)
        } else if (node.type === 'boolean') {
          s = node.data ? '1' : ''
        } else if (node.type === 'build-in') {
          tmp = this.buildInFunctions[node.name].process.call(this, node, data)
          if (typeof tmp.tpl !== 'undefined') {
            // If tmp is object, which means it has modified, data also
            // so copy it back to data.
            s = tmp.tpl
            data = tmp.data
          } else {
            // If tmp is string means it has not modified data.
            s = tmp
          }
        } else if (node.type === 'plugin') {
          if (this.runTimePlugins[node.name]) {
            // Thats call for {function}.
            tmp = this.buildInFunctions['function'].process.call(this, node, data)
            if (typeof tmp.tpl !== 'undefined') {
              // If tmp is object, which means it has modified, data also
              // so copy it back to data.
              s = tmp.tpl
              data = tmp.data
            } else {
              // If tmp is string means it has not modified data.
              s = tmp
            }
          } else {
            plugin = this.plugins[node.name]
            if (plugin.type === 'block') {
              // TODO:: Add code to handle block level plugins.
            } else if (plugin.type === 'function') {
              s = plugin.process(this.getActualParamValues(node.params, data), data)
            }
          }
        }
        if (typeof s === 'boolean') {
          s = s ? '1' : ''
        }
        if (s === null) {
          s = ''
        }
        if (tree.length === 1) {
          return {tpl: s, data: data}
        }
        res += ((s !== null) ? s : '')

        if (data.smarty.continue || data.smarty.break) {
          return {tpl: res, data: data}
        }
      }
      return {tpl: res, data: data}
    },

    getActualParamValues: function (params, data) {
      var actualParams = []
      var v
      for (var name in params.__parsed) {
        if (params.__parsed.hasOwnProperty(name)) {
          v = this.process([params.__parsed[name]], data)
          if (typeof v !== 'undefined') {
            data = v.data
            v = v.tpl
          }
          actualParams[name] = v
        }
      }
      actualParams.__get = function (name, defVal, id) {
        if (name in actualParams && typeof actualParams[name] !== 'undefined') {
          return actualParams[name]
        }
        if (typeof id !== 'undefined' && typeof actualParams[id] !== 'undefined') {
          return actualParams[id]
        }
        if (defVal === null) {
          throw new Error('The required attribute "' + name + '" is missing')
        }
        return defVal
      }
      return actualParams
    },

    getVarValue: function (node, data, value) {
      var v = data
      var name = ''
      var i
      var part

      for (i = 0; i < node.parts.length; ++i) {
        part = node.parts[i]
        if (part.type === 'plugin' && part.name === '__func' && part.hasOwner) {
          data.__owner = v
          v = this.process([node.parts[i]], data)
          if (typeof v.tpl !== 'undefined') {
            data = v.data
            v = v.tpl
          }
          delete data.__owner
        } else {
          name = this.process([part], data)
          if (typeof name !== 'undefined') {
            data = name.data
            name = name.tpl
          }

          // Section Name.
          var processOutput = this.process([node.parts[0]], data)
          if (typeof processOutput !== 'undefined') {
            data = processOutput.data
            processOutput = processOutput.tpl
          }
          if (name in data.smarty.section && part.type === 'text' && (processOutput !== 'smarty')) {
            name = data.smarty.section[name].index
          }

          // Add to array
          if (!name && typeof value !== 'undefined' && v instanceof Array) {
            name = v.length
          }

          // Set new value.
          if (typeof value !== 'undefined' && i === (node.parts.length - 1)) {
            v[name] = value
          }

          if (typeof v === 'object' && v !== null && name in v) {
            v = v[name]
          } else {
            if (typeof value === 'undefined') {
              return value
            }
            v[name] = {}
            v = v[name]
          }
        }
      }
      return v
    },

    // TODO:: Remove this duplicate function.
    // Apply the filters to template.
    applyFilters: function (filters, tpl) {
      for (var i = 0; i < filters.length; ++i) {
        tpl = filters[i](tpl)
      }
      return tpl
    },

    assignVar: function (name, value, data) {
      if (name.match(/\[\]$/)) {
        // ar[] =
        data[name.replace(/\[\]$/, '')].push(value)
      } else {
        data[name] = value
      }
      return data
    },

    buildInFunctions: {
      expression: {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var res = this.process([node.expression], data)

          if (typeof res !== 'undefined') {
            data = res.data
            res = res.tpl
          }
          if (findInArray(params, 'nofilter') < 0) {
            for (var i = 0; i < this.defaultModifiers.length; ++i) {
              var m = this.defaultModifiers[i]
              m.params.__parsed[0] = {type: 'text', data: res}
              res = this.process([m], data)
              if (typeof res !== 'undefined') {
                data = res.data
                res = res.tpl
              }
            }
            if (this.escapeHtml) {
              res = this.modifiers.escape(res)
            }
            res = this.applyFilters(this.variableFilters, res)
            if (this.tplModifiers.length) {
              // Write in global scope __t() function is called, it works.
              // TODO:: Refactor this code.
              window.__t = function () { return res }
              res = this.process(this.tplModifiers, data)
              if (typeof res !== 'undefined') {
                data = res.data
                res = res.tpl
              }
            }
          }
          return {tpl: res, data: data}
        }
      },

      append: {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var varName = params.__get('var', null, 0)
          if (!(varName in data) || !(data[varName] instanceof Array)) {
            data[varName] = []
          }
          var index = params.__get('index', false)
          var val = params.__get('value', null, 1)
          if (index === false) {
            data[varName].push(val)
          } else {
            data[varName][index] = val
          }
          return {tpl: '', data: data}
        }
      },

      assign: {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          return {tpl: '', data: this.assignVar(params.__get('var', null, 0), params.__get('value', null, 1), data)}
        }
      },

      capture: {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          node.name = ('cap-' + node.params.name)
          var content = this.process(node.subTree, data)
          if (typeof content !== 'undefined') {
            data = content.data
            content = content.tpl
          }
          content = content.replace(/^\n/, '')
          data.smarty.capture[params.__get('name', 'default', 0)] = content
          if ('assign' in params) {
            data = this.assignVar(params.assign, content, data)
          }
          var append = params.__get('append', false)
          if (append) {
            if (append in data) {
              if (data[append] instanceof Array) {
                data[append].push(content)
              }
            } else {
              data[append] = [content]
            }
          }
          return {tpl: '', data: data}
        }
      },

      operator: {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var arg1 = params[0]
          var arg2
          var isVar

          if (node.optype === 'binary') {
            arg2 = params[1]
            if (node.op === '=') {
              // TODO:: why do not we return the var value?
              this.getVarValue(node.params.__parsed[0], data, arg2)
              return ''
            } else if (node.op.match(/(\+=|-=|\*=|\/=|%=)/)) {
              arg1 = this.getVarValue(node.params.__parsed[0], data)
              switch (node.op) {
                case '+=': {
                  arg1 += arg2
                  break
                }
                case '-=': {
                  arg1 -= arg2
                  break
                }
                case '*=': {
                  arg1 *= arg2
                  break
                }
                case '/=': {
                  arg1 /= arg2
                  break
                }
                case '%=': {
                  arg1 %= arg2
                  break
                }
              }
              return this.getVarValue(node.params.__parsed[0], data, arg1)
            } else if (node.op.match(/div/)) {
              return (node.op !== 'div') ^ (arg1 % arg2 === 0)
            } else if (node.op.match(/even/)) {
              return (node.op !== 'even') ^ ((arg1 / arg2) % 2 === 0)
            } else if (node.op.match(/xor/)) {
              return (arg1 || arg2) && !(arg1 && arg2)
            }

            switch (node.op) {
              case '==': {
                return arg1 == arg2 // eslint-disable-line eqeqeq
              }
              case '!=': {
                return arg1 != arg2 // eslint-disable-line eqeqeq
              }
              case '+': {
                return Number(arg1) + Number(arg2)
              }
              case '-': {
                return Number(arg1) - Number(arg2)
              }
              case '*': {
                return Number(arg1) * Number(arg2)
              }
              case '/': {
                return Number(arg1) / Number(arg2)
              }
              case '%': {
                return Number(arg1) % Number(arg2)
              }
              case '&&': {
                return arg1 && arg2
              }
              case '||': {
                return arg1 || arg2
              }
              case '<': {
                return arg1 < arg2
              }
              case '<=': {
                return arg1 <= arg2
              }
              case '>': {
                return arg1 > arg2
              }
              case '===': {
                return arg1 === arg2
              }
              case '>=': {
                return arg1 >= arg2
              }
              case '!==': {
                return arg1 !== arg2
              }
            }
          } else if (node.op === '!') {
            return !arg1
          } else {
            isVar = node.params.__parsed[0].type === 'var'
            if (isVar) {
              arg1 = this.getVarValue(node.params.__parsed[0], data)
            }
            var v = arg1
            if (node.optype === 'pre-unary') {
              switch (node.op) {
                case '-': {
                  v = -arg1
                  break
                }
                case '++': {
                  v = ++arg1
                  break
                }
                case '--': {
                  v = --arg1
                  break
                }
              }
              if (isVar) {
                this.getVarValue(node.params.__parsed[0], data, arg1)
              }
            } else {
              switch (node.op) {
                case '++': {
                  arg1++
                  break
                }
                case '--': {
                  arg1--
                  break
                }
              }
              this.getVarValue(node.params.__parsed[0], data, arg1)
            }
            return v
          }
        }
      },

      section: {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var props = {}
          var show = params.__get('show', true)

          data.smarty.section[params.__get('name', null, 0)] = props
          props.show = show

          if (!show) {
            return this.process(node.subTreeElse, data)
          }

          var from = parseInt(params.__get('start', 0), 10)
          var to = (params.loop instanceof Object) ? countProperties(params.loop) : isNaN(params.loop) ? 0 : parseInt(params.loop)
          var step = parseInt(params.__get('step', 1), 10)
          var max = parseInt(params.__get('max'), 10)
          if (isNaN(max)) {
            max = Number.MAX_VALUE
          }

          if (from < 0) {
            from += to
            if (from < 0) {
              from = 0
            }
          } else if (from >= to) {
            from = to ? to - 1 : 0
          }

          var count = 0
          var i = from
          props.total = count
          // ? - because it is so in Smarty
          props.loop = count

          count = 0
          var s = ''
          for (i = from; i >= 0 && i < to && count < max; i += step, ++count) {
            if (data.smarty.break) {
              break
            }

            props.first = (i === from)
            props.last = ((i + step) < 0 || (i + step) >= to)
            props.index = i
            props.index_prev = i - step
            props.index_next = i + step
            props.iteration = props.rownum = count + 1

            var tmp = this.process(node.subTree, data)
            if (typeof tmp !== 'undefined') {
              data = tmp.data
              s += tmp.tpl
            }
            data.smarty.continue = false
          }
          data.smarty.break = false

          if (count) {
            return {tpl: s, data: data}
          }
          return this.process(node.subTreeElse, data)
        }
      },

      setfilter: {
        process: function (node, data) {
          this.tplModifiers = node.params
          var s = this.process(node.subTree, data)
          if (typeof s !== 'undefined') {
            data = s.data
            s = s.tpl
          }
          this.tplModifiers = []
          return {tpl: s, data: data}
        }
      },

      'for': {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var from = parseInt(params.__get('from'), 10)
          var to = parseInt(params.__get('to'), 10)
          var step = parseInt(params.__get('step'), 10)
          if (isNaN(step)) {
            step = 1
          }
          var max = parseInt(params.__get('max'), 10)
          if (isNaN(max)) {
            max = Number.MAX_VALUE
          }

          var count = 0
          var s = ''
          var total = Math.min(Math.ceil(((step > 0 ? to - from : from - to) + 1) / Math.abs(step)), max)

          for (var i = parseInt(params.from, 10); count < total; i += step, ++count) {
            if (data.smarty.break) {
              break
            }
            data[params.varName] = i
            var tmp = this.process(node.subTree, data)
            if (typeof tmp !== 'undefined') {
              data = tmp.data
              s += tmp.tpl
            }
            data.smarty.continue = false
          }
          data.smarty.break = false

          if (!count) {
            var tmp2 = this.process(node.subTreeElse, data)
            if (typeof tmp2 !== 'undefined') {
              data = tmp2.data
              s = tmp2.tpl
            }
          }
          return {tpl: s, data: data}
        }
      },

      'if': {
        process: function (node, data) {
          var value = this.getActualParamValues(node.params, data)[0]
          // Zero length arrays or empty associative arrays are false in PHP.
          if (value && !((value instanceof Array && value.length === 0) ||
            (typeof value === 'object' && isEmptyObject(value)))
          ) {
            return this.process(node.subTreeIf, data)
          } else {
            return this.process(node.subTreeElse, data)
          }
        }
      },

      nocache: {
        process: function (node, data) {
          return this.process(node.subTree, data)
        }
      },

      'foreach': {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var a = params.from
          if (typeof a === 'undefined') {
            a = []
          }
          if (typeof a !== 'object') {
            a = [a]
          }

          var total = countProperties(a)

          data[params.item + '__total'] = total
          if ('name' in params) {
            data.smarty.foreach[params.name] = {}
            data.smarty.foreach[params.name].total = total
          }

          var s = ''
          var i = 0
          for (var key in a) {
            if (!a.hasOwnProperty(key)) {
              continue
            }

            if (data.smarty.break) {
              break
            }

            data[params.item + '__key'] = isNaN(key) ? key : parseInt(key, 10)
            if ('key' in params) {
              data[params.key] = data[params.item + '__key']
            }
            data[params.item] = a[key]
            data[params.item + '__index'] = parseInt(i, 10)
            data[params.item + '__iteration'] = parseInt(i + 1, 10)
            data[params.item + '__first'] = (i === 0)
            data[params.item + '__last'] = (i === total - 1)

            if ('name' in params) {
              data.smarty.foreach[params.name].index = parseInt(i, 10)
              data.smarty.foreach[params.name].iteration = parseInt(i + 1, 10)
              data.smarty.foreach[params.name].first = (i === 0) ? 1 : ''
              data.smarty.foreach[params.name].last = (i === total - 1) ? 1 : ''
            }

            ++i

            var tmp2 = this.process(node.subTree, data)
            if (typeof tmp2 !== 'undefined') {
              data = tmp2.data
              s += tmp2.tpl
            }
            data.smarty.continue = false
          }
          data.smarty.break = false

          data[params.item + '__show'] = (i > 0)
          if (params.name) {
            data.smarty.foreach[params.name].show = (i > 0) ? 1 : ''
          }
          if (i > 0) {
            return s
          }
          return this.process(node.subTreeElse, data)
        }
      },

      'call': {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var newNode = {name: params.__get('name'), params: node.params}
          var s = this.buildInFunctions['function'].process.call(this, newNode, data)
          var assignTo = params.__get('assign', false)
          if (assignTo) {
            return {tpl: '', data: this.assignVar(assignTo, s, data)}
          } else {
            return s
          }
        }
      },

      include: {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var file = params.__get('file', null, 0)
          var incData = objectMerge({}, data, params)
          incData.smarty.template = file
          var content = this.process(node.subTree, incData)
          if (typeof content !== 'undefined') {
            // We do not copy data from child template, to the parent. Child
            // template can use parent data blocks, but does send it back to
            // parent. data = content.data;
            content = content.tpl
          }
          if (params.assign) {
            return {tpl: '', data: this.assignVar(params.assign, content, data)}
          } else {
            return content
          }
        }
      },

      counter: {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var name = params.__get('name', 'default')
          if (name in data.smarty.counter) {
            var counter = data.smarty.counter[name]
            if ('start' in params) {
              counter.value = parseInt(params['start'], 10)
            } else {
              counter.value = parseInt(counter.value, 10)
              counter.skip = parseInt(counter.skip, 10)
              if (counter.direction === 'down') {
                counter.value -= counter.skip
              } else {
                counter.value += counter.skip
              }
            }
            counter.skip = params.__get('skip', counter.skip)
            counter.direction = params.__get('direction', counter.direction)
            counter.assign = params.__get('assign', counter.assign)
            data.smarty.counter[name] = counter
          } else {
            data.smarty.counter[name] = {
              value: parseInt(params.__get('start', 1), 10),
              skip: parseInt(params.__get('skip', 1), 10),
              direction: params.__get('direction', 'up'),
              assign: params.__get('assign', false)
            }
          }
          if (data.smarty.counter[name].assign) {
            data[data.smarty.counter[name].assign] = data.smarty.counter[name].value
            return {tpl: '', data: data}
          }
          if (params.__get('print', true)) {
            return {tpl: data.smarty.counter[name].value, data: data}
          }
          // User didn't assign and also said, print false.
          return {tpl: '', data: data}
        }
      },

      'function': {
        process: function (node, data) {
          var funcData = this.runTimePlugins[node.name]
          var defaults = this.getActualParamValues(funcData.defaultParams, data)
          delete defaults.name
          // We need to get param values for node.params too.
          var params = this.getActualParamValues(node.params, data)

          var obj = this.process(funcData.tree, objectMerge({}, data, defaults, params))
          // We do not return data:data like other built in  functions. Because node.params
          // are specific as argument for this function and we do not want modifify original
          // object with this value.
          return obj.tpl
        }
      },

      'while': {
        process: function (node, data) {
          var s = ''
          while (this.getActualParamValues(node.params, data)[0]) {
            if (data.smarty.break) {
              break
            }
            var tmp2 = this.process(node.subTree, data)
            if (typeof tmp2 !== 'undefined') {
              data = tmp2.data
              s += tmp2.tpl
            }
            data.smarty.continue = false
          }
          data.smarty.break = false
          return {tpl: s, data: data}
        }
      }
    }
  }
var version = '3.0.0'

  /*
   Define jsmart constructor. jSmart object just stores,
   tree, $smarty block and some intialization methods.
   We keep jSmart object light weight as one page or program
   might contain to many jSmart objects.
   Keep parser and processor outside of jSmart objects, help
   us not to store, same parser and processor methods in all
   jSmart object.
  */
  var jSmart = function (template, options) {
    this.parse(template, options)
  }

  // Add more properties to jSmart core.
  jSmart.prototype = {
    constructor: jSmart,

    // Current tree structure.
    tree: [],

    // Current javascript files loaded via include_javascript.
    scripts: {},

    // List of all modifiers present in the app.
    modifiers: {},

    // All the modifiers to apply by default to all variables.
    defaultModifiers: [],

    // Global modifiers which which can be used in all instances.
    defaultModifiersGlobal: [],

    // Cache for global and default modifiers merged version to apply.
    globalAndDefaultModifiers: [],

    // Filters which are applied to all variables are in 'variable'.
    // Filters which are applied after processing whole template are in 'post'.
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

    // Cached value for all default and global variable filters.
    // Only for variable.
    globalAndDefaultFilters: [],

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

    // Store current runtime plugins. Generally used for
    // {function} tags.
    runTimePlugins: {},

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
      'foreach': {},

      // All the section blocks in the current smarty object.
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
    parse: function (template, options) {
      var parsedTemplate
      if (!options) {
        options = {}
      }
      if (options.rdelim) {
        // If delimiters are passed locally take them.
        this.smarty.rdelim = options.rdelim
      } else if (jSmart.prototype.right_delimiter) {
        // Backward compatible. Old way to set via prototype.
        this.smarty.rdelim = jSmart.prototype.right_delimiter
      }
      if (options.ldelim) {
        // If delimiters are passed locally take them.
        this.smarty.ldelim = options.ldelim
      } else if (jSmart.prototype.left_delimiter) {
        // Backward compatible. Old way to set via prototype.
        this.smarty.ldelim = jSmart.prototype.left_delimiter
      }
      if (options.autoLiteral !== undefined) {
        // If autoLiteral is passed locally, take it.
        this.autoLiteral = options.autoLiteral
      } else if (jSmart.prototype.auto_literal !== undefined) {
        // Backward compatible. Old way to set via prototype.
        this.autoLiteral = jSmart.prototype.auto_literal
      }

      if (options.debugging !== undefined) {
        // If debugging is passed locally, take it.
        this.debugging = options.debugging
      }

      if (options.escapeHtml !== undefined) {
        // If escapeHtml is passed locally, take it.
        this.escapeHtml = options.escapeHtml
      } else if (jSmart.prototype.escape_html !== undefined) {
        // Backward compatible. Old way to set via prototype.
        this.escapeHtml = jSmart.prototype.escape_html
      }

      // Is template string or at least defined?!
      template = String(template || '')

      // Generate the tree. We pass delimiters and many config values
      // which are needed by parser to parse like delimiters.
      jSmartParser.clear()
      jSmartParser.rdelim = this.smarty.rdelim
      jSmartParser.ldelim = this.smarty.ldelim
      jSmartParser.getTemplate = this.getTemplate
      jSmartParser.autoLiteral = this.autoLiteral
      jSmartParser.plugins = this.plugins
      jSmartParser.preFilters = this.filtersGlobal.pre
      // Above parser config are set, lets parse.
      parsedTemplate = jSmartParser.getParsed(template)
      this.tree = parsedTemplate.tree
      this.runTimePlugins = parsedTemplate.runTimePlugins
    },

    // Process the generated tree.
    fetch: function (data) {
      var outputData = ''
      if (!(typeof data === 'object')) {
        data = {}
      }
      // Define smarty inside data and copy smarty vars, so one can use $smarty
      // vars inside templates.
      data.smarty = {}
      objectMerge(data.smarty, this.smarty)

      // Take default global modifiers, add with local default modifiers.
      // Merge them and keep them cached.
      this.globalAndDefaultModifiers = jSmart.prototype.defaultModifiersGlobal.concat(this.defaultModifiers)

      // Take default global filters, add with local default filters.
      // Merge them and keep them cached.
      this.globalAndDefaultFilters = jSmart.prototype.filtersGlobal.variable.concat(this.filters.variable)

      jSmartProcessor.clear()
      jSmartProcessor.plugins = this.plugins
      jSmartProcessor.modifiers = this.modifiers
      jSmartProcessor.defaultModifiers = this.defaultModifiers
      jSmartProcessor.escapeHtml = this.escapeHtml
      jSmartProcessor.variableFilters = this.globalAndDefaultFilters
      jSmartProcessor.runTimePlugins = this.runTimePlugins

      // Capture the output by processing the template.
      outputData = jSmartProcessor.getProcessed(this.tree, data, this.smarty)

      // Merge back smarty data returned by process to original object.
      objectMerge(this.smarty, outputData.smarty)
      // Apply post filters to output and return the template data.
      return this.applyFilters(jSmart.prototype.filtersGlobal.post.concat(this.filters.post), outputData.output)
    },

    // Apply the filters to template.
    applyFilters: function (filters, tpl) {
      for (var i = 0; i < filters.length; ++i) {
        tpl = filters[i](tpl)
      }
      return tpl
    },

    // Register a plugin.
    registerPlugin: function (type, name, callback) {
      if (type === 'modifier') {
        this.modifiers[name] = callback
      } else {
        this.plugins[name] = {'type': type, 'process': callback}
      }
    },

    // Register a filter.
    registerFilter: function (type, callback) {
      (this.tree ? this.filters : jSmart.prototype.filtersGlobal)[((type === 'output') ? 'post' : type)].push(callback)
    },

    addDefaultModifier: function (modifiers) {
      if (!(modifiers instanceof Array)) {
        modifiers = [modifiers]
      }

      for (var i = 0; i < modifiers.length; ++i) {
        var data = jSmartParser.parseModifiers('|' + modifiers[i], [0])
        if (this.tree) {
          this.defaultModifiers.push(data.tree[0])
        } else {
          this.defaultModifiersGlobal.push(data.tree[0])
        }
      }
    },

    getTemplate: function (name) {
      throw new Error('No template for ' + name)
    },

    getFile: function (name) {
      throw new Error('No file for ' + name)
    },

    getJavascript: function (name) {
      throw new Error('No Javascript for ' + name)
    },

    getConfig: function (name) {
      throw new Error('No config for ' + name)
    }
  }
jSmart.prototype.registerPlugin(
    'modifier',
    'defaultValue',
    function (s, value) {
      value = value || ''
      return (s && s !== 'null' && typeof s !== 'undefined') ? s : value
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'upper',
    function (s) {
      return (String(s)).toUpperCase()
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'lower',
    function (s) {
      return (String(s)).toLowerCase()
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'replace',
    function (s, search, replaceWith) {
      if (!search) {
        return s
      }
      s = String(s)
      search = String(search)
      replaceWith = String(replaceWith)
      var res = ''
      var pos = -1
      for (pos = s.indexOf(search); pos >= 0; pos = s.indexOf(search)) {
        res += s.slice(0, pos) + replaceWith
        pos += search.length
        s = s.slice(pos)
      }
      return res + s
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'count_characters',
    function (s, includeWhitespaces) {
      s = String(s)
      return includeWhitespaces ? s.length : s.replace(/\s/g, '').length
    }
  )
jSmart.prototype.registerPlugin(
    'function',
    '__quoted',
    function (params, data) {
      return params.join('')
    }
  )

  // Register __array which gets called for all arrays.
  jSmart.prototype.registerPlugin(
    'function',
    '__array',
    function (params, data) {
      var a = []
      for (var name in params) {
        if (params.hasOwnProperty(name) && params[name] && typeof params[name] !== 'function') {
          a[name] = params[name]
        }
      }
      return a
    }
  )

  // Register __func which gets called for all modifiers and function calls.
  jSmart.prototype.registerPlugin(
    'function',
    '__func',
    function (params, data) {
      var paramData = []
      var i
      var fname

      for (i = 0; i < params.length; ++i) {
        paramData.push(params[i])
      }

      if (('__owner' in data && params.name in data.__owner)) {
        fname = data['__owner']
        if (params.length) {
          return fname[params.name].apply(fname, params)
        } else {
          // When function doesn't has arguments.
          return fname[params.name].apply(fname)
        }
      } else if (jSmart.prototype.modifiers.hasOwnProperty(params.name)) {
        fname = jSmart.prototype.modifiers[params.name]
        return fname.apply(fname, paramData)
      } else {
        fname = params.name
        var func
        if (typeof module === 'object' && module && typeof module.exports === 'object') {
          func = global[fname]
        } else {
          if (window && window.document) {
            func = window[fname]
          }
        }
        console.log(func)
        if (data[fname]) {
          return data[fname].apply(data[fname], paramData)
        } else if (func) {
          return func.apply(func, paramData)
        }
        // something went wrong.
        return ''
      }
    }
  )



  return jSmart
})
