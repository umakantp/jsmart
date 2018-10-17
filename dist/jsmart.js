/*!
 * jSmart JavaScript template engine (v3.1.0)
 * https://github.com/umakantp/jsmart
 *
 * Copyright 2011-2017, Umakant Patil <me at umakantpatil dot com>
 *                      Max Miroshnikov <miroshnikov at gmail dot com>
 * https://opensource.org/licenses/MIT
 *
 * Date: 2018-10-17T13:13Z
 */
(function (factory) {
  'use strict'

  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    // Node.js like environment. Export jSmart
    module.exports = factory()
  } else {
    if (typeof window === 'object' && window.document) {
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

    outerBlocks: {},

    blocks: {},

    getTemplate: function (name) {
      throw new Error('no getTemplate function defined.')
    },

    getConfig: function () {
      throw new Error('no getConfig function defined.')
    },

    clear: function () {
      // Clean up config, specific for this parsing.
      this.runTimePlugins = {}
      this.preFilters = []
      this.autoLiteral = true
      this.plugins = {}
      this.ldelim = '{'
      this.rdelim = '}'
      this.blocks = {}
      this.outerBlocks = {}
    },

    getTree: function (template) {
      var tree
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

      if (tree.usedExtends > 0) {
        var tmpTree = []
        // Now in the tree remove anything other than block after extends
        for (var i = 0; i < tree.length; i++) {
          if (i < tree.usedExtends) {
            tmpTree.push(tree[i])
          } else if (tree[i].type === 'build-in' && (tree[i].name === 'block')) {
            tmpTree.push(tree[i])
          }
        }
        tree = tmpTree
      }

      return tree
    },

    // Parse the template and return the data.
    getParsed: function (template) {
      var tree = this.getTree(template)
      var runTimePlugins

      // Copy so far runtime plugins were generated.
      runTimePlugins = this.runTimePlugins

      var blocks = this.blocks

      var outerBlocks = this.outerBlocks

      this.clear()
      // Nope, we do not want to clear the cache.
      // Refactor to maintain cache. Until that keep commented.
      // this.files = {};
      return {
        tree: tree,
        runTimePlugins: runTimePlugins,
        blocks: blocks,
        outerBlocks: outerBlocks
      }
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
      var usedExtends = 0

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
                usedExtends = tree.length
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
      tree.usedExtends = usedExtends
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
      var parts = [{type: 'text', data: name.replace(/^(\w+)@(key|index|iteration|first|last|show|total)/gi, '$1__$2')}]
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
        tree = this.getTree(tpl)
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

      for (var openTag = tpl.match(ldelim); openTag; openTag = tpl.match(ldelim)) {
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
          var dataVar = this.parseVar('.config.' + RegExp.$1, 'smarty', '$smarty')
          var dataMod = this.parseModifiers(dataVar.s, dataVar.tree)
          if (dataMod) {
            dataVar.value += dataMod.value
            return dataMod
          }
          return dataVar
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

      config_load: {
        'type': 'function',
        parse: function (params) {
          var file = trimAllQuotes(params.file ? params.file : params[0])
          var content = this.getConfig(file)
          var section = trimAllQuotes(params.section ? params.section : (params[1] ? params[1] : ''))

          return {
            type: 'build-in',
            name: 'config_load',
            params: params,
            content: content,
            section: section
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

      'break': {
        'type': 'function',
        parse: function (params) {
          return {
            type: 'build-in',
            name: 'break',
            params: params
          }
        }
      },

      'continue': {
        'type': 'function',
        parse: function (params) {
          return {
            type: 'build-in',
            name: 'continue',
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

      'eval': {
        'type': 'function',
        parse: function (params) {
          return this.parsePluginFunc('eval', params)
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

      'extends': {
        type: 'function',
        parse: function (params) {
          return this.loadTemplate(trimAllQuotes(((params.file) ? params.file : params[0])), true)
        }
      },

      block: {
        type: 'block',
        parse: function (params, content) {
          params.append = findInArray(params, 'append') >= 0
          params.prepend = findInArray(params, 'prepend') >= 0
          params.hide = findInArray(params, 'hide') >= 0

          var match
          var tree = this.parse(content, [])
          var blockName = trimAllQuotes(params.name ? params.name : params[0])
          var location
          if (!(blockName in this.blocks)) {
            // This is block inside extends as it gets call first
            // when the extends is processed?!
            this.blocks[blockName] = []
            this.blocks[blockName] = {tree: tree, params: params}
            location = 'inner'
            match = content.match(/smarty.block.child/)
            params.needChild = false
            if (match) {
              params.needChild = true
            }
          } else {
            // this.blocks has this block, means this outer block after extends
            this.outerBlocks[blockName] = []
            this.outerBlocks[blockName] = {tree: tree, params: params}
            location = 'outer'
            match = content.match(/smarty.block.parent/)
            params.needParent = false
            if (match) {
              params.needParent = true
            }
          }
          return {
            type: 'build-in',
            name: 'block',
            params: params,
            location: location
          }
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

    outerBlocks: {},

    blocks: {},

    // If user wants to debug.
    debugging: false,

    clear: function () {
      // Clean up config, specific for this processing.
      this.runTimePlugins = {}
      this.variableFilters = []
      this.escapeHtml = false
      this.defaultModifiers = {}
      this.modifiers = {}
      this.plugins = {}
      this.blocks = {}
      this.outerBlocks = {}
      this.debugging = false
      this.includedTemplates = []
    },

    // Process the tree and return the data.
    getProcessed: function (tree, data) {
      // Process the tree and get the output.
      var output = this.process(tree, data)
      if (this.debugging) {
        this.plugins.debug.process([], {
          includedTemplates: this.includedTemplates,
          assignedVars: data
        })
      }
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
          s = !!node.data
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
              var repeat = {value: true}
              while (repeat.value) {
                repeat.value = false
                tmp = this.process(node.subTree, data)
                if (typeof tmp.tpl !== 'undefined') {
                  data = tmp.data
                  tmp = tmp.tpl
                }
                s += plugin.process.call(
                  this,
                  this.getActualParamValues(node.params, data),
                  tmp,
                  data,
                  repeat
                )
              }
            } else if (plugin.type === 'function') {
              s = plugin.process.call(this, this.getActualParamValues(node.params, data), data)
            }
          }
        }
        if (typeof s === 'boolean' && tree.length !== 1) {
          s = s ? '1' : ''
        }
        if (s === null || s === undefined) {
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

    configLoad: function (content, section, data) {
      var s = content.replace(/\r\n/g, '\n').replace(/^\s+|\s+$/g, '')
      var regex = /^\s*(?:\[([^\]]+)\]|(?:(\w+)[ \t]*=[ \t]*("""|'[^'\\\n]*(?:\\.[^'\\\n]*)*'|"[^"\\\n]*(?:\\.[^"\\\n]*)*"|[^\n]*)))/m
      var triple
      var currSect = ''
      for (var f = s.match(regex); f; f = s.match(regex)) {
        s = s.slice(f.index + f[0].length)
        if (f[1]) {
          currSect = f[1]
        } else if ((!currSect || currSect === section) && currSect.substr(0, 1) !== '.') {
          if (f[3] === '"""') {
            triple = s.match(/"""/)
            if (triple) {
              data.smarty.config[f[2]] = s.slice(0, triple.index)
              s = s.slice(triple.index + triple[0].length)
            }
          } else {
            data.smarty.config[f[2]] = trimAllQuotes(f[3])
          }
        }
        var newln = s.match(/\n+/)
        if (newln) {
          s = s.slice(newln.index + newln[0].length)
        } else {
          break
        }
      }
      return data
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
              if (typeof window === 'object' && window.document) {
                window.__t = function () { return res }
              } else {
                // Node.js like environment?!
                global['__t'] = function () { return res }
              }
              res = this.process(this.tplModifiers[this.tplModifiers.length - 1], data)
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

      config_load: {
        process: function (node, data) {
          data = this.configLoad(node.content, node.section, data)
          return {
            tpl: '',
            data: data
          }
        }
      },

      capture: {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
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
              // Var value is returned, but also set inside data.
              // we use the data and override ours.
              this.getVarValue(node.params.__parsed[0], data, arg2)
              return {tpl: '', data: data}
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
            props.total = count
            // ? - because it is so in Smarty
            props.loop = count

            var tmp = this.process(node.subTree, data)
            if (typeof tmp !== 'undefined') {
              data = tmp.data
              s += tmp.tpl
            }
            data.smarty.continue = false
          }
          props.total = count
          // ? - because it is so in Smarty
          props.loop = count

          data.smarty.break = false

          if (count) {
            return {tpl: s, data: data}
          }
          return this.process(node.subTreeElse, data)
        }
      },

      setfilter: {
        process: function (node, data) {
          this.tplModifiers.push(node.params)
          var s = this.process(node.subTree, data)
          if (typeof s !== 'undefined') {
            data = s.data
            s = s.tpl
          }
          this.tplModifiers.pop()
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

      'break': {
        process: function (node, data) {
          data.smarty.break = true
          return {
            tpl: '',
            data: data
          }
        }
      },

      'continue': {
        process: function (node, data) {
          data.smarty.continue = true
          return {
            tpl: '',
            data: data
          }
        }
      },

      block: {
        process: function (node, data) {
          var blockName = trimAllQuotes(node.params.name ? node.params.name : node.params[0])
          var innerBlock = this.blocks[blockName]
          var innerBlockContent
          var outerBlock = this.outerBlocks[blockName]
          var outerBlockContent
          var output

          if (node.location === 'inner') {
            if (innerBlock.params.needChild) {
              outerBlockContent = this.process(outerBlock.tree, data)
              if (typeof outerBlockContent.tpl !== 'undefined') {
                outerBlockContent = outerBlockContent.tpl
              }
              data.smarty.block.child = outerBlockContent
              innerBlockContent = this.process(innerBlock.tree, data)
              if (typeof innerBlockContent.tpl !== 'undefined') {
                innerBlockContent = innerBlockContent.tpl
              }
              output = innerBlockContent
            } else if (outerBlock.params.needParent) {
              innerBlockContent = this.process(innerBlock.tree, data)
              if (typeof innerBlockContent.tpl !== 'undefined') {
                innerBlockContent = innerBlockContent.tpl
              }
              data.smarty.block.parent = innerBlockContent
              outerBlockContent = this.process(outerBlock.tree, data)
              if (typeof outerBlockContent.tpl !== 'undefined') {
                outerBlockContent = outerBlockContent.tpl
              }
              output = outerBlockContent
            } else {
              outerBlockContent = this.process(outerBlock.tree, data)
              if (typeof outerBlockContent.tpl !== 'undefined') {
                outerBlockContent = outerBlockContent.tpl
              }
              if (outerBlock.params.append) {
                innerBlockContent = this.process(innerBlock.tree, data)
                if (typeof innerBlockContent.tpl !== 'undefined') {
                  innerBlockContent = innerBlockContent.tpl
                }
                output = outerBlockContent + innerBlockContent
              } else if (outerBlock.params.prepend) {
                innerBlockContent = this.process(innerBlock.tree, data)
                if (typeof innerBlockContent.tpl !== 'undefined') {
                  innerBlockContent = innerBlockContent.tpl
                }
                output = innerBlockContent + outerBlockContent
              } else {
                output = outerBlockContent
              }
            }
            return output
          }
          // Outer block should not be printed it just used to
          // capture the content
          return ''
        }
      },

      'call': {
        process: function (node, data) {
          var params = this.getActualParamValues(node.params, data)
          var name = params.__get('name') ? params.__get('name') : params.__get('0')
          var newNode = {name: name, params: node.params}
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
          this.includedTemplates.push(file)
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
var version = '3.1.0'

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
    // Smarty object which has version, delimiters, config, current directory
    // and all blocks like PHP Smarty.
    this.smarty = {

      // Blocks in the current smarty object.
      block: {},

      // Used to store state of break;
      'break': false,

      // All the capture blocks in the current smarty object.
      capture: {},

      // Used to store state of continue
      'continue': false,

      // Current counter information. Smarty like feature.
      counter: {},

      // Use by {cycle} custom function to store array and cycle info.
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
    }

    // Whether to skip tags in open brace { followed by white space(s) and close brace } with white space(s) before.
    this.autoLiteral = true

    // Escape html??
    this.escapeHtml = false

    // If user wants debug to be enabled.
    this.debugging = false

    // Store outer blocks below extends.
    this.outerBlocks = {}

    // Stores inner blocks.
    this.blocks = {}

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

    // Store current runtime plugins. Generally used for
    // {function} tags.
    runTimePlugins: {},

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
      } else {
        // Otherwise default delimiters
        this.smarty.rdelim = '}'
      }
      if (options.ldelim) {
        // If delimiters are passed locally take them.
        this.smarty.ldelim = options.ldelim
      } else if (jSmart.prototype.left_delimiter) {
        // Backward compatible. Old way to set via prototype.
        this.smarty.ldelim = jSmart.prototype.left_delimiter
      } else {
        // Otherwise default delimiters
        this.smarty.ldelim = '{'
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
      } else if (jSmart.prototype.debugging !== undefined) {
        // Backward compatible. Old way to set via prototype.
        this.debugging = jSmart.prototype.debugging
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
      jSmartParser.getConfig = this.getConfig
      jSmartParser.autoLiteral = this.autoLiteral
      jSmartParser.plugins = this.plugins
      jSmartParser.preFilters = this.filtersGlobal.pre
      // Above parser config are set, lets parse.
      parsedTemplate = jSmartParser.getParsed(template)
      this.tree = parsedTemplate.tree
      this.runTimePlugins = parsedTemplate.runTimePlugins
      this.blocks = parsedTemplate.blocks
      this.outerBlocks = parsedTemplate.outerBlocks
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
      jSmartProcessor.blocks = this.blocks
      jSmartProcessor.outerBlocks = this.outerBlocks
      jSmartProcessor.debugging = this.debugging

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

    // Print the object.
    printR: function (toPrint, indent, indentEnd) {
      if (!indent) {
        indent = '&nbsp;&nbsp;'
      }
      if (!indentEnd) {
        indentEnd = ''
      }
      var s = ''
      var name
      if (toPrint instanceof Object) {
        s = 'Object (\n'
        for (name in toPrint) {
          if (toPrint.hasOwnProperty(name)) {
            s += indent + indent + '[' + name + '] => ' + this.printR(toPrint[name], indent + '&nbsp;&nbsp;', indent + indent)
          }
        }
        s += indentEnd + ')\n'
        return s
      } else if (toPrint instanceof Array) {
        s = 'Array (\n'
        for (name in toPrint) {
          if (toPrint.hasOwnProperty(name)) {
            s += indent + indent + '[' + name + '] => ' + this.printR(toPrint[name], indent + '&nbsp;&nbsp;', indent + indent)
          }
        }
        s += indentEnd + ')\n'
        return s
      } else if (toPrint instanceof Boolean) {
        var bool = 'false'
        if (bool === true) {
          bool = 'true'
        }
        return bool + '\n'
      } else {
        return (toPrint + '\n')
      }
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


  // Copied from  http://locutus.io/php/get_html_translation_table/
  function getHtmlTranslationTable (table, quoteStyle) {
    var entities = {}
    var hashMap = {}
    var decimal
    var constMappingTable = {}
    var constMappingQuoteStyle = {}
    var useTable = {}
    var useQuoteStyle = {}

    // Translate arguments
    constMappingTable[0] = 'HTML_SPECIALCHARS'
    constMappingTable[1] = 'HTML_ENTITIES'
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES'
    constMappingQuoteStyle[2] = 'ENT_COMPAT'
    constMappingQuoteStyle[3] = 'ENT_QUOTES'

    useTable = !isNaN(table)
      ? constMappingTable[table]
      : table
        ? table.toUpperCase()
        : 'HTML_SPECIALCHARS'

    useQuoteStyle = !isNaN(quoteStyle)
      ? constMappingQuoteStyle[quoteStyle]
      : quoteStyle
        ? quoteStyle.toUpperCase()
        : 'ENT_COMPAT'

    if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
      throw new Error('Table: ' + useTable + ' not supported')
    }

    entities['38'] = '&amp;'
    if (useTable === 'HTML_ENTITIES') {
      entities['160'] = '&nbsp;'
      entities['161'] = '&iexcl;'
      entities['162'] = '&cent;'
      entities['163'] = '&pound;'
      entities['164'] = '&curren;'
      entities['165'] = '&yen;'
      entities['166'] = '&brvbar;'
      entities['167'] = '&sect;'
      entities['168'] = '&uml;'
      entities['169'] = '&copy;'
      entities['170'] = '&ordf;'
      entities['171'] = '&laquo;'
      entities['172'] = '&not;'
      entities['173'] = '&shy;'
      entities['174'] = '&reg;'
      entities['175'] = '&macr;'
      entities['176'] = '&deg;'
      entities['177'] = '&plusmn;'
      entities['178'] = '&sup2;'
      entities['179'] = '&sup3;'
      entities['180'] = '&acute;'
      entities['181'] = '&micro;'
      entities['182'] = '&para;'
      entities['183'] = '&middot;'
      entities['184'] = '&cedil;'
      entities['185'] = '&sup1;'
      entities['186'] = '&ordm;'
      entities['187'] = '&raquo;'
      entities['188'] = '&frac14;'
      entities['189'] = '&frac12;'
      entities['190'] = '&frac34;'
      entities['191'] = '&iquest;'
      entities['192'] = '&Agrave;'
      entities['193'] = '&Aacute;'
      entities['194'] = '&Acirc;'
      entities['195'] = '&Atilde;'
      entities['196'] = '&Auml;'
      entities['197'] = '&Aring;'
      entities['198'] = '&AElig;'
      entities['199'] = '&Ccedil;'
      entities['200'] = '&Egrave;'
      entities['201'] = '&Eacute;'
      entities['202'] = '&Ecirc;'
      entities['203'] = '&Euml;'
      entities['204'] = '&Igrave;'
      entities['205'] = '&Iacute;'
      entities['206'] = '&Icirc;'
      entities['207'] = '&Iuml;'
      entities['208'] = '&ETH;'
      entities['209'] = '&Ntilde;'
      entities['210'] = '&Ograve;'
      entities['211'] = '&Oacute;'
      entities['212'] = '&Ocirc;'
      entities['213'] = '&Otilde;'
      entities['214'] = '&Ouml;'
      entities['215'] = '&times;'
      entities['216'] = '&Oslash;'
      entities['217'] = '&Ugrave;'
      entities['218'] = '&Uacute;'
      entities['219'] = '&Ucirc;'
      entities['220'] = '&Uuml;'
      entities['221'] = '&Yacute;'
      entities['222'] = '&THORN;'
      entities['223'] = '&szlig;'
      entities['224'] = '&agrave;'
      entities['225'] = '&aacute;'
      entities['226'] = '&acirc;'
      entities['227'] = '&atilde;'
      entities['228'] = '&auml;'
      entities['229'] = '&aring;'
      entities['230'] = '&aelig;'
      entities['231'] = '&ccedil;'
      entities['232'] = '&egrave;'
      entities['233'] = '&eacute;'
      entities['234'] = '&ecirc;'
      entities['235'] = '&euml;'
      entities['236'] = '&igrave;'
      entities['237'] = '&iacute;'
      entities['238'] = '&icirc;'
      entities['239'] = '&iuml;'
      entities['240'] = '&eth;'
      entities['241'] = '&ntilde;'
      entities['242'] = '&ograve;'
      entities['243'] = '&oacute;'
      entities['244'] = '&ocirc;'
      entities['245'] = '&otilde;'
      entities['246'] = '&ouml;'
      entities['247'] = '&divide;'
      entities['248'] = '&oslash;'
      entities['249'] = '&ugrave;'
      entities['250'] = '&uacute;'
      entities['251'] = '&ucirc;'
      entities['252'] = '&uuml;'
      entities['253'] = '&yacute;'
      entities['254'] = '&thorn;'
      entities['255'] = '&yuml;'
      entities['8364'] = '&euro;'
    }

    if (useQuoteStyle !== 'ENT_NOQUOTES') {
      entities['34'] = '&quot;'
    }
    if (useQuoteStyle === 'ENT_QUOTES') {
      entities['39'] = '&#39;'
    }
    entities['60'] = '&lt;'
    entities['62'] = '&gt;'

    // ascii decimals to real symbols
    for (decimal in entities) {
      if (entities.hasOwnProperty(decimal)) {
        hashMap[String.fromCharCode(decimal)] = entities[decimal]
      }
    }

    return hashMap
  }


  var phpJs = {
    // Copied from http://locutus.io/php/strings/ord/
    ord: function (string) {
      var str = string + ''
      var code = str.charCodeAt(0)
      if (code >= 0xD800 && code <= 0xDBFF) {
        var hi = code
        if (str.length === 1) {
          return code
        }
        var low = str.charCodeAt(1)
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000
      }
      if (code >= 0xDC00 && code <= 0xDFFF) {
        return code
      }
      return code
    },

    // Copied from http://locutus.io/php/strings/bin2hex/
    bin2Hex: function (s) {
      var i
      var l
      var o = ''
      var n
      s += ''
      for (i = 0, l = s.length; i < l; i++) {
        n = s.charCodeAt(i).toString(16)
        o += n.length < 2 ? '0' + n : n
      }
      return o
    },

    // Copied from http://locutus.io/php/strings/html_entity_decode/
    htmlEntityDecode: function (string, quoteStyle) {
      var tmpStr = string.toString()
      var entity = ''
      var symbol = ''
      var hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
      if (hashMap === false) {
        return false
      }
      delete (hashMap['&'])
      hashMap['&'] = '&amp;'
      for (symbol in hashMap) {
        entity = hashMap[symbol]
        tmpStr = tmpStr.split(entity).join(symbol)
      }
      tmpStr = tmpStr.split('&#039;').join("'")
      return tmpStr
    },

    objectKeys: function (o) {
      var k = []
      var p
      for (p in o) {
        if (Object.prototype.hasOwnProperty.call(o, p)) {
          k.push(p)
        }
      }
      return k
    },

    htmlEntities: function (string, quoteStyle, charset, doubleEncode) {
      var hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
      var keys
      string = string === null ? '' : string + ''
      if (!hashMap) {
        return false
      }

      if (quoteStyle && quoteStyle === 'ENT_QUOTES') {
        hashMap["'"] = '&#039;'
      }
      doubleEncode = doubleEncode === null || !!doubleEncode
      keys = Object.keys ? Object.keys(hashMap) : phpJs.objectKeys(hashMap)
      var regex = new RegExp('&(?:#\\d+|#x[\\da-f]+|[a-zA-Z][\\da-z]*);|[' +
        keys.join('')
          .replace(/([()[\]{}\-.*+?^$|/\\])/g, '\\$1') + ']', 'g')

      return string.replace(regex, function (ent) {
        if (ent.length > 1) {
          return doubleEncode ? hashMap['&'] + ent.substr(1) : ent
        }
        return hashMap[ent]
      })
    },

    rawUrlDecode: function (string) {
      return decodeURIComponent((string + '').replace(/%(?![\da-f]{2})/gi, function () {
        // PHP tolerates poorly formed escape sequences
        return '%25'
      }))
    },

    rawUrlEncode: function (string) {
      string = (string + '')
      return encodeURIComponent(string)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
    },

    sprintf: function () {
      var regex = /%%|%(\d+\$)?([-+'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g
      var a = arguments
      var i = 0
      var format = a[i++]

      var _pad = function (str, len, chr, leftJustify) {
        if (!chr) {
          chr = ' '
        }
        var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
        return leftJustify ? str + padding : padding + str
      }

      var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length
        if (diff > 0) {
          if (leftJustify || !zeroPad) {
            value = _pad(value, minWidth, customPadChar, leftJustify)
          } else {
            value = [
              value.slice(0, prefix.length),
              _pad('', diff, '0', true),
              value.slice(prefix.length)
            ].join('')
          }
        }
        return value
      }

      var _formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0
        prefix = (prefix && number && {
          '2': '0b',
          '8': '0',
          '16': '0x'
        }[base]) || ''
        value = prefix + _pad(number.toString(base), precision || 0, '0', false)
        return justify(value, prefix, leftJustify, minWidth, zeroPad)
      }

      // _formatString()
      var _formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision !== null && precision !== undefined) {
          value = value.slice(0, precision)
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar)
      }

      // doFormat()
      var doFormat = function (substring, valueIndex, flags, minWidth, precision, type) {
        var number, prefix, method, textTransform, value

        if (substring === '%%') {
          return '%'
        }

        // parse flags
        var leftJustify = false
        var positivePrefix = ''
        var zeroPad = false
        var prefixBaseX = false
        var customPadChar = ' '
        var flagsl = flags.length
        var j
        for (j = 0; j < flagsl; j++) {
          switch (flags.charAt(j)) {
            case ' ':
              positivePrefix = ' '
              break
            case '+':
              positivePrefix = '+'
              break
            case '-':
              leftJustify = true
              break
            case "'":
              customPadChar = flags.charAt(j + 1)
              break
            case '0':
              zeroPad = true
              customPadChar = '0'
              break
            case '#':
              prefixBaseX = true
              break
          }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
          minWidth = 0
        } else if (minWidth === '*') {
          minWidth = +a[i++]
        } else if (minWidth.charAt(0) === '*') {
          minWidth = +a[minWidth.slice(1, -1)]
        } else {
          minWidth = +minWidth
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
          minWidth = -minWidth
          leftJustify = true
        }

        if (!isFinite(minWidth)) {
          throw new Error('sprintf: (minimum-)width must be finite')
        }

        if (!precision) {
          precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined
        } else if (precision === '*') {
          precision = +a[i++]
        } else if (precision.charAt(0) === '*') {
          precision = +a[precision.slice(1, -1)]
        } else {
          precision = +precision
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++]

        switch (type) {
          case 's':
            return _formatString(value + '', leftJustify, minWidth, precision, zeroPad, customPadChar)
          case 'c':
            return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad)
          case 'b':
            return _formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'o':
            return _formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'x':
            return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'X':
            return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase()
          case 'u':
            return _formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'i':
          case 'd':
            number = +value || 0
            // Plain Math.round doesn't just truncate
            number = Math.round(number - number % 1)
            prefix = number < 0 ? '-' : positivePrefix
            value = prefix + _pad(String(Math.abs(number)), precision, '0', false)
            return justify(value, prefix, leftJustify, minWidth, zeroPad)
          case 'e':
          case 'E':
          case 'f': // @todo: Should handle locales (as per setlocale)
          case 'F':
          case 'g':
          case 'G':
            number = +value
            prefix = number < 0 ? '-' : positivePrefix
            method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())]
            textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2]
            value = prefix + Math.abs(number)[method](precision)
            return phpJs.justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]()
          default:
            return substring
        }
      }

      return format.replace(regex, doFormat)
    },

    makeTimeStamp: function (s) {
      if (!s) {
        return Math.floor(new Date().getTime() / 1000)
      }
      if (isNaN(s)) {
        var tm = phpJs.strtotime(s)
        if (tm === -1 || tm === false) {
          return Math.floor(new Date().getTime() / 1000)
        }
        return tm
      }
      s = s + ''
      if (s.length === 14 && s.search(/^[\d]+$/g) !== -1) {
        // it is mysql timestamp format of YYYYMMDDHHMMSS?
        return phpJs.mktime(s.substr(8, 2), s.substr(10, 2), s.substr(12, 2), s.substr(4, 2), s.substr(6, 2), s.substr(0, 4))
      }
      return Number(s)
    },

    mktime: function () {
      var d = new Date()
      var r = arguments
      var i = 0
      var e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear']

      for (i = 0; i < e.length; i++) {
        if (typeof r[i] === 'undefined') {
          r[i] = d['get' + e[i]]()
          // +1 to fix JS months.
          r[i] += (i === 3)
        } else {
          r[i] = parseInt(r[i], 10)
          if (isNaN(r[i])) {
            return false
          }
        }
      }

      r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0)
      d.setFullYear(r[5], r[3] - 1, r[4])
      d.setHours(r[0], r[1], r[2])
      var time = d.getTime()
      return (time / 1e3 >> 0) - (time < 0)
    },

    _pad: function (str, len, chr, leftJustify) {
      if (!chr) {
        chr = ' '
      }
      var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
      return leftJustify ? str + padding : padding + str
    },

    justify: function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
      var diff = minWidth - value.length
      if (diff > 0) {
        if (leftJustify || !zeroPad) {
          value = phpJs._pad(value, minWidth, customPadChar, leftJustify)
        } else {
          value = [
            value.slice(0, prefix.length),
            phpJs._pad('', diff, '0', true),
            value.slice(prefix.length)
          ].join('')
        }
      }
      return value
    },

    strtotime: function (text, now) {
      var parsed
      var match
      var today
      var year
      var date
      var days
      var ranges
      var len
      var times
      var regex
      var i
      var fail = false

      if (!text) {
        return fail
      }

      text = text.replace(/^\s+|\s+$/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/[\t\r\n]/g, '')
        .toLowerCase()

      var pattern = new RegExp([
        '^(\\d{1,4})',
        '([\\-\\.\\/:])',
        '(\\d{1,2})',
        '([\\-\\.\\/:])',
        '(\\d{1,4})',
        '(?:\\s(\\d{1,2}):(\\d{2})?:?(\\d{2})?)?',
        '(?:\\s([A-Z]+)?)?$'
      ].join(''))
      match = text.match(pattern)

      if (match && match[2] === match[4]) {
        if (match[1] > 1901) {
          switch (match[2]) {
            case '-':
              // YYYY-M-D
              if (match[3] > 12 || match[5] > 31) {
                return fail
              }

              return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '.':
              // YYYY.M.D is not parsed by strtotime()
              return fail
            case '/':
              // YYYY/M/D
              if (match[3] > 12 || match[5] > 31) {
                return fail
              }

              return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
          }
        } else if (match[5] > 1901) {
          switch (match[2]) {
            case '-':
              // D-M-YYYY
              if (match[3] > 12 || match[1] > 31) {
                return fail
              }

              return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '.':
              // D.M.YYYY
              if (match[3] > 12 || match[1] > 31) {
                return fail
              }

              return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '/':
              // M/D/YYYY
              if (match[1] > 12 || match[3] > 31) {
                return fail
              }

              return new Date(match[5], parseInt(match[1], 10) - 1, match[3],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
          }
        } else {
          switch (match[2]) {
            case '-':
              // YY-M-D
              if (match[3] > 12 || match[5] > 31 || (match[1] < 70 && match[1] > 38)) {
                return fail
              }

              year = match[1] >= 0 && match[1] <= 38 ? +match[1] + 2000 : match[1]
              return new Date(year, parseInt(match[3], 10) - 1, match[5],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '.':
              // D.M.YY or H.MM.SS
              if (match[5] >= 70) {
                // D.M.YY
                if (match[3] > 12 || match[1] > 31) {
                  return fail
                }

                return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                  match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
              }
              if (match[5] < 60 && !match[6]) {
                // H.MM.SS
                if (match[1] > 23 || match[3] > 59) {
                  return fail
                }

                today = new Date()
                return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                  match[1] || 0, match[3] || 0, match[5] || 0, match[9] || 0) / 1000
              }

              // invalid format, cannot be parsed
              return fail
            case '/':
              // M/D/YY
              if (match[1] > 12 || match[3] > 31 || (match[5] < 70 && match[5] > 38)) {
                return fail
              }

              year = match[5] >= 0 && match[5] <= 38 ? +match[5] + 2000 : match[5]
              return new Date(year, parseInt(match[1], 10) - 1, match[3],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case ':':
              // HH:MM:SS
              if (match[1] > 23 || match[3] > 59 || match[5] > 59) {
                return fail
              }

              today = new Date()
              return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                match[1] || 0, match[3] || 0, match[5] || 0) / 1000
          }
        }
      }

      if (text === 'now') {
        return now === null || isNaN(now)
          ? new Date().getTime() / 1000 | 0
          : now | 0
      }

      if (!isNaN(parsed = Date.parse(text))) {
        return parsed / 1000 | 0
      }

      pattern = new RegExp([
        '^([0-9]{4}-[0-9]{2}-[0-9]{2})',
        '[ t]',
        '([0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]+)?)',
        '([\\+-][0-9]{2}(:[0-9]{2})?|z)'
      ].join(''))
      match = text.match(pattern)
      if (match) {
        // @todo: time zone information
        if (match[4] === 'z') {
          match[4] = 'Z'
        } else if (match[4].match(/^([+-][0-9]{2})$/)) {
          match[4] = match[4] + ':00'
        }

        if (!isNaN(parsed = Date.parse(match[1] + 'T' + match[2] + match[4]))) {
          return parsed / 1000 | 0
        }
      }

      date = now ? new Date(now * 1000) : new Date()
      days = {
        'sun': 0,
        'mon': 1,
        'tue': 2,
        'wed': 3,
        'thu': 4,
        'fri': 5,
        'sat': 6
      }
      ranges = {
        'yea': 'FullYear',
        'mon': 'Month',
        'day': 'Date',
        'hou': 'Hours',
        'min': 'Minutes',
        'sec': 'Seconds'
      }

      function lastNext (type, range, modifier) {
        var diff
        var day = days[range]

        if (typeof day !== 'undefined') {
          diff = day - date.getDay()

          if (diff === 0) {
            diff = 7 * modifier
          } else if (diff > 0 && type === 'last') {
            diff -= 7
          } else if (diff < 0 && type === 'next') {
            diff += 7
          }

          date.setDate(date.getDate() + diff)
        }
      }

      function process (val) {
        var splt = val.split(' ')
        var type = splt[0]
        var range = splt[1].substring(0, 3)
        var typeIsNumber = /\d+/.test(type)
        var ago = splt[2] === 'ago'
        var num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1)

        if (typeIsNumber) {
          num *= parseInt(type, 10)
        }

        if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) {
          return date['set' + ranges[range]](date['get' + ranges[range]]() + num)
        }

        if (range === 'wee') {
          return date.setDate(date.getDate() + (num * 7))
        }

        if (type === 'next' || type === 'last') {
          lastNext(type, range, num)
        } else if (!typeIsNumber) {
          return false
        }

        return true
      }

      times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' +
        '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' +
        '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)'
      regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?'

      match = text.match(new RegExp(regex, 'gi'))
      if (!match) {
        return fail
      }

      for (i = 0, len = match.length; i < len; i++) {
        if (!process(match[i])) {
          return fail
        }
      }

      return (date.getTime() / 1000)
    },

    strftime: function (fmt, timestamp) {
      var _xPad = function (x, pad, r) {
        if (typeof r === 'undefined') {
          r = 10
        }
        for (; parseInt(x, 10) < r && r > 1; r /= 10) {
          x = pad.toString() + x
        }
        return x.toString()
      }

      // Only english
      var lcTime = {
        a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        // ABDAY_
        A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        // DAY_
        b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        // ABMON_
        B: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
          'August', 'September', 'October',
          'November', 'December'
        ],
        // MON_
        c: '%a %d %b %Y %r %Z',
        // D_T_FMT // changed %T to %r per results
        p: ['AM', 'PM'],
        // AM_STR/PM_STR
        P: ['am', 'pm'],
        // Not available in nl_langinfo()
        r: '%I:%M:%S %p',
        // T_FMT_AMPM (Fixed for all locales)
        x: '%m/%d/%Y',
        // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
        X: '%r',
        // T_FMT // changed from %T to %r  (%T is default for C, not English US)
        // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
        alt_digits: '',
        // e.g., ordinal
        ERA: '',
        ERA_YEAR: '',
        ERA_D_T_FMT: '',
        ERA_D_FMT: '',
        ERA_T_FMT: ''
      }

      var _formats = {
        a: function (d) {
          return lcTime.a[d.getDay()]
        },
        A: function (d) {
          return lcTime.A[d.getDay()]
        },
        b: function (d) {
          return lcTime.b[d.getMonth()]
        },
        B: function (d) {
          return lcTime.B[d.getMonth()]
        },
        C: function (d) {
          return _xPad(parseInt(d.getFullYear() / 100, 10), 0)
        },
        d: ['getDate', '0'],
        e: ['getDate', ' '],
        g: function (d) {
          return _xPad(parseInt(this.G(d) / 100, 10), 0) // eslint-disable-line new-cap
        },
        G: function (d) {
          var y = d.getFullYear()
          var V = parseInt(_formats.V(d), 10) // eslint-disable-line new-cap
          var W = parseInt(_formats.W(d), 10) // eslint-disable-line new-cap

          if (W > V) {
            y++
          } else if (W === 0 && V >= 52) {
            y--
          }

          return y
        },
        H: ['getHours', '0'],
        I: function (d) {
          var I = d.getHours() % 12
          return _xPad(I === 0 ? 12 : I, 0)
        },
        j: function (d) {
          var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT')
          // Line differs from Yahoo implementation which would be
          // equivalent to replacing it here with:
          ms += d.getTimezoneOffset() * 60000
          var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1
          return _xPad(doy, 0, 100)
        },
        k: ['getHours', '0'],
        // not in PHP, but implemented here (as in Yahoo)
        l: function (d) {
          var l = d.getHours() % 12
          return _xPad(l === 0 ? 12 : l, ' ')
        },
        m: function (d) {
          return _xPad(d.getMonth() + 1, 0)
        },
        M: ['getMinutes', '0'],
        p: function (d) {
          return lcTime.p[d.getHours() >= 12 ? 1 : 0]
        },
        P: function (d) {
          return lcTime.P[d.getHours() >= 12 ? 1 : 0]
        },
        s: function (d) {
          // Yahoo uses return parseInt(d.getTime()/1000, 10);
          return Date.parse(d) / 1000
        },
        S: ['getSeconds', '0'],
        u: function (d) {
          var dow = d.getDay()
          return ((dow === 0) ? 7 : dow)
        },
        U: function (d) {
          var doy = parseInt(_formats.j(d), 10)
          var rdow = 6 - d.getDay()
          var woy = parseInt((doy + rdow) / 7, 10)
          return _xPad(woy, 0)
        },
        V: function (d) {
          var woy = parseInt(_formats.W(d), 10) // eslint-disable-line new-cap
          var dow11 = (new Date('' + d.getFullYear() + '/1/1')).getDay()
          // First week is 01 and not 00 as in the case of %U and %W,
          // so we add 1 to the final result except if day 1 of the year
          // is a Monday (then %W returns 01).
          // We also need to subtract 1 if the day 1 of the year is
          // Friday-Sunday, so the resulting equation becomes:
          var idow = woy + (dow11 > 4 || dow11 <= 1 ? 0 : 1)
          if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4) {
            idow = 1
          } else if (idow === 0) {
            idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31')) // eslint-disable-line new-cap
          }
          return _xPad(idow, 0)
        },
        w: 'getDay',
        W: function (d) {
          var doy = parseInt(_formats.j(d), 10)
          var rdow = 7 - _formats.u(d)
          var woy = parseInt((doy + rdow) / 7, 10)
          return _xPad(woy, 0, 10)
        },
        y: function (d) {
          return _xPad(d.getFullYear() % 100, 0)
        },
        Y: 'getFullYear',
        z: function (d) {
          var o = d.getTimezoneOffset()
          var H = _xPad(parseInt(Math.abs(o / 60), 10), 0)
          var M = _xPad(o % 60, 0)
          return (o > 0 ? '-' : '+') + H + M
        },
        Z: function (d) {
          return d.toString().replace(/^.*\(([^)]+)\)$/, '$1')
        },
        '%': function (d) {
          return '%'
        }
      }

      var _date = (typeof timestamp === 'undefined')
        ? new Date()
        : (timestamp instanceof Date)
          ? new Date(timestamp)
          : new Date(timestamp * 1000)

      var _aggregates = {
        c: 'locale',
        D: '%m/%d/%y',
        F: '%y-%m-%d',
        h: '%b',
        n: '\n',
        r: 'locale',
        R: '%H:%M',
        t: '\t',
        T: '%H:%M:%S',
        x: 'locale',
        X: 'locale'
      }

      // First replace aggregates (run in a loop because an agg may be made up of other aggs)
      while (fmt.match(/%[cDFhnrRtTxX]/)) {
        fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function (m0, m1) {
          var f = _aggregates[m1]
          return (f === 'locale' ? lcTime[m1] : f)
        })
      }

      // Now replace formats - we need a closure so that the date object gets passed through
      var str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function (m0, m1) {
        var f = _formats[m1]
        if (typeof f === 'string') {
          return _date[f]()
        } else if (typeof f === 'function') {
          return f(_date)
        } else if (typeof f === 'object' && typeof f[0] === 'string') {
          return _xPad(_date[f[0]](), f[1])
        } else {
          // Shouldn't reach here
          return m1
        }
      })

      return str
    }
  }


  jSmart.prototype.registerPlugin(
    'modifier',
    'capitalize',
    function (s, upDigits, lcRest) {
      if (typeof s !== 'string') {
        return s
      }
      var re = new RegExp(upDigits ? '[^a-zA-Z_\u00E0-\u00FC]+' : '[^a-zA-Z0-9_\u00E0-\u00FC]')
      var found = null
      var res = ''
      if (lcRest) {
        s = s.toLowerCase()
      }
      var word
      for (found = s.match(re); found; found = s.match(re)) {
        word = s.slice(0, found.index)
        if (word.match(/\d/)) {
          res += word
        } else {
          res += word.charAt(0).toUpperCase() + word.slice(1)
        }
        res += s.slice(found.index, found.index + found[0].length)
        s = s.slice(found.index + found[0].length)
      }
      if (s.match(/\d/)) {
        return res + s
      }
      return res + s.charAt(0).toUpperCase() + s.slice(1)
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'cat',
    function (s, value) {
      value = value || ''
      return String(s) + value
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'count',
    function (a) {
      if (a instanceof Array) {
        return a.length
      } else if (typeof a === 'object') {
        if (Object.keys) {
          return Object.keys(a).length
        } else {
          var l = 0
          for (var k in a) {
            if (a.hasOwnProperty(k)) {
              ++l
            }
          }
          return l
        }
      }
      return 0
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
    'modifier',
    'count_paragraphs',
    function (s) {
      var found = String(s).match(/\n+/g)
      if (found) {
        return found.length + 1
      }
      return 1
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'count_sentences',
    function (s) {
      if (typeof s === 'string') {
        var found = s.match(/\w[.?!](\W|$)/g)
        if (found) {
          return found.length
        }
      }
      return 0
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'count_words',
    function (s) {
      if (typeof s === 'string') {
        var found = s.match(/\w+/g)
        if (found) {
          return found.length
        }
      }
      return 0
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'date_format',
    function (s, fmt, defaultDate) {
      return phpJs.strftime((fmt || '%b %e, %Y'), phpJs.makeTimeStamp((s || defaultDate)))
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'debug_print_var',
    function (s) {
      console.log(s + '--')
      // Determining environment first. If its node, we do console.logs
      // else we open new windows for browsers.
      var env = ''
      if (typeof module === 'object' && module && typeof module.exports === 'object') {
        env = 'node'
      } else if (typeof window === 'object' && window.document) {
        env = 'browser'
      }
      if (env === '') {
        // We do not know env.
        return ''
      }
      if (env === 'browser') {
        return jSmart.prototype.printR(s)
      } else {
        console.log(s)
      }
    }
  )

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
    'escape',
    function (s, escType, charSet, doubleEncode) {
      s = String(s)
      escType = escType || 'html'
      charSet = charSet || 'UTF-8'
      doubleEncode = (typeof doubleEncode !== 'undefined') ? Boolean(doubleEncode) : true
      var res = ''
      var i

      switch (escType) {
        case 'html': {
          if (doubleEncode) {
            s = s.replace(/&/g, '&amp;')
          }
          return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#039;').replace(/"/g, '&quot;')
        }
        case 'htmlall': {
          return phpJs.htmlEntities(s, 3, charSet)
        }
        case 'url': {
          return phpJs.rawUrlEncode(s)
        }
        case 'urlpathinfo': {
          return phpJs.rawUrlEncode(s).replace(/%2F/g, '/')
        }
        case 'quotes': {
          return s.replace(/(^|[^\\])'/g, "$1\\'")
        }
        case 'hex': {
          res = ''
          for (i = 0; i < s.length; ++i) {
            res += '%' + phpJs.bin2Hex(s.substr(i, 1)).toLowerCase()
          }
          return res
        }
        case 'hexentity': {
          res = ''
          for (i = 0; i < s.length; ++i) {
            res += '&#x' + phpJs.bin2Hex(s.substr(i, 1)) + ';'
          }
          return res
        }
        case 'decentity': {
          res = ''
          for (i = 0; i < s.length; ++i) {
            res += '&#' + phpJs.ord(s.substr(i, 1)) + ';'
          }
          return res
        }
        case 'mail': {
          return s.replace(/@/g, ' [AT] ').replace(/[.]/g, ' [DOT] ')
        }
        case 'nonstd': {
          res = ''
          for (i = 0; i < s.length; ++i) {
            var _ord = phpJs.ord(s.substr(i, 1))
            if (_ord >= 126) {
              res += '&#' + _ord + ';'
            } else {
              res += s.substr(i, 1)
            }
          }
          return res
        }
        case 'javascript': {
          return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/<\//g, '</')
        }
      }
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'from_charset',
    function (s) {
      // No implementation in JS. But modifier should not fail hencce this.
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'indent',
    function (s, repeat, indentWith) {
      s = String(s)
      repeat = repeat || 4
      indentWith = indentWith || ' '

      var indentStr = ''
      while (repeat--) {
        indentStr += indentWith
      }

      var tail = s.match(/\n+$/)
      return indentStr + s.replace(/\n+$/, '').replace(/\n/g, '\n' + indentStr) + (tail ? tail[0] : '')
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
    'nl2br',
    function (s) {
      return String(s).replace(/\n/g, '<br />')
    }
  )

  // only modifiers (flags) 'i' and 'm' are supported
  // backslashes should be escaped e.g. \\s
  jSmart.prototype.registerPlugin(
    'modifier',
    'regex_replace',
    function (s, re, replaceWith) {
      var pattern = re.match(/^ *\/(.*)\/(.*) *$/)
      return String(s).replace(new RegExp(pattern[1], 'g' + (pattern.length > 1 ? pattern[2] : '')), replaceWith)
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
    'spacify',
    function (s, space) {
      if (!space) {
        space = ' '
      }
      return String(s).replace(/(\n|.)(?!$)/g, '$1' + space)
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'string_format',
    function (s, fmt) {
      return phpJs.sprintf(fmt, s)
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'strip',
    function (s, replaceWith) {
      replaceWith = replaceWith || ' '
      return String(s).replace(/[\s]+/g, replaceWith)
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'strip_tags',
    function (s, addSpaceOrTagsToExclude, tagsToExclude) {
      if (addSpaceOrTagsToExclude === null) {
        addSpaceOrTagsToExclude = true
      }
      if (!tagsToExclude) {
        if (addSpaceOrTagsToExclude !== true && addSpaceOrTagsToExclude !== false && ((addSpaceOrTagsToExclude + '').length > 0)) {
          tagsToExclude = addSpaceOrTagsToExclude
          addSpaceOrTagsToExclude = true
        }
      }
      if (tagsToExclude) {
        var filters = tagsToExclude.split('>')
        filters.splice(-1, 1)
        s = String(s).replace(/<[^>]*?>/g, function (match, offset, contents) {
          var tagName = match.match(/\w+/)
          for (var i = 0; i < filters.length; i++) {
            var tagName2 = (filters[i] + '>').match(/\w+/)
            if (tagName[0] === tagName2[0]) {
              return match
            }
          }
          return addSpaceOrTagsToExclude ? ' ' : ''
        })
        return s
      }
      return String(s).replace(/<[^>]*?>/g, addSpaceOrTagsToExclude ? ' ' : '')
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'to_charset',
    function (s) {
      // No implementation in JS. But modifier should not fail hencce this.
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'truncate',
    function (s, length, etc, breakWords, middle) {
      s = String(s)
      length = length || 80
      etc = (etc != null) ? etc : '...'

      if (s.length <= length) {
        return s
      }

      length -= Math.min(length, etc.length)
      if (middle) {
        // one of floor()'s should be replaced with ceil() but it so in Smarty
        return s.slice(0, Math.floor(length / 2)) + etc + s.slice(s.length - Math.floor(length / 2))
      }

      if (!breakWords) {
        s = s.slice(0, length + 1).replace(/\s+?(\S+)?$/, '')
      }

      return s.slice(0, length) + etc
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'unescape',
    function (s, escType, charSet) {
      s = String(s)
      escType = escType || 'html'
      charSet = charSet || 'UTF-8'

      switch (escType) {
        case 'html': {
          return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"')
        }
        case 'entity': {
          return phpJs.htmlEntityDecode(s, 1)
        }
        case 'htmlall': {
          return phpJs.htmlEntityDecode(s, 1)
        }
        case 'url': {
          return phpJs.rawUrlDecode(s)
        }
      }
      return s
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
    'wordwrap',
    function (s, width, wrapWith, breakWords) {
      width = width || 80
      wrapWith = wrapWith || '\n'

      var lines = String(s).split('\n')
      for (var i = 0; i < lines.length; ++i) {
        var line = lines[i]
        var parts = ''
        while (line.length > width) {
          var pos = 0
          var found = line.slice(pos).match(/\s+/)
          for (; found && (pos + found.index) <= width; found = line.slice(pos).match(/\s+/)) {
            pos += found.index + found[0].length
          }
          pos = (breakWords ? (width - 1) : (pos || (found ? found.index + found[0].length : line.length)))
          parts += line.slice(0, pos).replace(/\s+$/, '')
          if (pos < line.length) {
            parts += wrapWith
          }
          line = line.slice(pos)
        }
        lines[i] = parts + line
      }
      return lines.join('\n')
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
          if (typeof window === 'object' && window.document) {
            func = window[fname]
          } else if (global) {
            func = global[fname]
          }
        }

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
// All built in but custom functions

  jSmart.prototype.registerPlugin(
    'function',
    'counter',
    function (params, data) {
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
        return ''
      }
      if (params.__get('print', true)) {
        return data.smarty.counter[name].value
      }
      // User didn't assign and also said, print false.
      return ''
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'cycle',
    function (params, data) {
      var name = params.__get('name', 'default')
      var reset = params.__get('reset', false)
      if (!(name in data.smarty.cycle)) {
        data.smarty.cycle[name] = {arr: [''], delimiter: params.__get('delimiter', ','), index: 0}
        reset = true
      }

      if (params.__get('delimiter', false)) {
        data.smarty.cycle[name].delimiter = params.delimiter
      }
      var values = params.__get('values', false)
      if (values) {
        var arr = []
        if (values instanceof Object) {
          for (var nm in values) {
            arr.push(values[nm])
          }
        } else {
          arr = values.split(data.smarty.cycle[name].delimiter)
        }

        if (arr.length !== data.smarty.cycle[name].arr.length || arr[0] !== data.smarty.cycle[name].arr[0]) {
          data.smarty.cycle[name].arr = arr
          data.smarty.cycle[name].index = 0
          reset = true
        }
      }

      if (params.__get('advance', 'true')) {
        data.smarty.cycle[name].index += 1
      }
      if (data.smarty.cycle[name].index >= data.smarty.cycle[name].arr.length || reset) {
        data.smarty.cycle[name].index = 0
      }

      if (params.__get('assign', false)) {
        this.assignVar(params.assign, data.smarty.cycle[name].arr[data.smarty.cycle[name].index], data)
        return ''
      }

      if (params.__get('print', true)) {
        return data.smarty.cycle[name].arr[data.smarty.cycle[name].index]
      }

      return ''
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'eval',
    function (params, data) {
      var s = params.var
      if ('assign' in params) {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'debug',
    function (params, data) {
      // Determining environment first. If its node, we do console.logs
      // else we open new windows for browsers.
      var env = ''
      if (typeof module === 'object' && module && typeof module.exports === 'object') {
        env = 'node'
      } else if (typeof window === 'object' && window.document) {
        env = 'browser'
      }
      if (env === '') {
        // We do not know env.
        return ''
      }
      if (env === 'browser') {
        if (window.jsmartDebug) {
          window.jsmartDebug.close()
        }
        window.jsmartDebug = window.open('', '', 'width=680, height=600,resizable,scrollbars=yes')
        var includedTemplates = ''
        var assignedVars = ''
        var i = 0
        for (var j in data.includedTemplates) {
          includedTemplates += '<tr class=' + (++i % 2 ? 'odd' : 'even') + '><td>' + data.includedTemplates[j] + '</td></tr>'
        }
        if (includedTemplates !== '') {
          includedTemplates = '<h2>included templates</h2><table>' + includedTemplates + '</table><br>'
        }
        i = 0
        for (var name in data.assignedVars) {
          assignedVars += '<tr class=' + (++i % 2 ? 'odd' : 'even') + '><td>[' + name + ']</td><td>' + jSmart.prototype.printR(data.assignedVars[name]) + '</td></tr>'
        }
        if (assignedVars !== '') {
          assignedVars = '<h2>assigned template variables</h2><table>' + assignedVars + '<table>'
        }
        var html = '<!DOCTYPE html>' +
        '<html>' +
          '<head>' +
            '<title>jSmart Debug Console</title>' +
            '<style type=\'text/css\'>' +
              'table {width: 100%;}' +
              'td {vertical-align:top;}' +
              '.odd td {background-color: #eee;}' +
              '.even td {background-color: #dadada;}' +
            '</style>' +
          '</head>' +
          '<body>' +
            '<h1>jSmart Debug Console</h1><br><pre>' +
            includedTemplates +
            assignedVars +
          '</pre></body>' +
        '</html>'
        window.jsmartDebug.document.write(html)
      } else {
        // env is node.
        // we stringify because tools show updated version of object in console.
        if (typeof console !== 'undefined') {
          console.log('included templates:- ' + JSON.stringify(includedTemplates))
          console.log('assigned template variables:- ' + JSON.stringify(assignedVars))
        }
      }
      return ''
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'fetch',
    function (params, data) {
      var s = jSmart.prototype.getFile(params.__get('file', null, 0))
      if ('assign' in params) {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_checkboxes',
    function (params, data) {
      var type = params.__get('type', 'checkbox')
      var name = params.__get('name', type)
      var realName = name
      var values = params.__get('values', params.options)
      var output = params.__get('options', [])
      var useName = ('options' in params)
      var selected = params.__get('selected', false)
      var separator = params.__get('separator', '')
      var labels = Boolean(params.__get('labels', true))
      var labelIds = Boolean(params.__get('label_ids', false))
      var p
      var res = []
      var i = 0
      var s = ''
      var value
      var id

      if (type === 'checkbox') {
        name += '[]'
      }

      if (!useName) {
        for (p in params.output) {
          output.push(params.output[p])
        }
      }

      for (p in values) {
        if (values.hasOwnProperty(p)) {
          value = (useName ? p : values[p])
          id = realName + '_' + value
          s = (labels ? (labelIds ? '<label for="' + id + '">' : '<label>') : '')
          s += '<input type="' + type + '" name="' + name + '" value="' + value + '" '
          if (labelIds) {
            s += 'id="' + id + '" '
          }
          if (selected == (useName ? p : values[p])) { // eslint-disable-line eqeqeq
            s += 'checked="checked" '
          }
          s += '/>' + output[useName ? p : i++]
          s += (labels ? '</label>' : '')
          s += separator
          res.push(s)
        }
      }

      if ('assign' in params) {
        this.assignVar(params.assign, res, data)
        return ''
      }
      return res.join('\n')
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_image',
    function (params, data) {
      var url = params.__get('file', null)
      var width = params.__get('width', false)
      var height = params.__get('height', false)
      var alt = params.__get('alt', '')
      var href = params.__get('href', params.__get('link', false))
      var pathPrefix = params.__get('path_prefix', '')
      var paramNames = {file: 1, width: 1, height: 1, alt: 1, href: 1, basedir: 1, pathPrefix: 1, link: 1}
      var s = '<img src="' + pathPrefix + url + '"' + ' alt="' + alt + '"' + (width ? ' width="' + width + '"' : '') + (height ? ' height="' + height + '"' : '')
      var p

      for (p in params) {
        if (params.hasOwnProperty(p) && typeof params[p] === 'string') {
          if (!(p in paramNames)) {
            s += ' ' + p + '="' + params[p] + '"'
          }
        }
      }
      s += ' />'
      return href ? '<a href="' + href + '">' + s + '</a>' : s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_options',
    function (params, data) {
      var values = params.__get('values', params.options)
      var output = params.__get('options', [])
      var useName = ('options' in params)
      var p
      if (!useName) {
        for (p in params.output) {
          output.push(params.output[p])
        }
      }
      var selected = params.__get('selected', false)
      var res = []
      var s = ''
      var i = 0
      var j
      if (selected instanceof Array) {
        // We convert each value of array to string because values
        // is array of string. Otherwise comparision fails.
        for (j in selected) {
          if (selected.hasOwnProperty(j)) {
            selected[j] = selected[j] + ''
          }
        }
      } else if (typeof selected !== 'boolean') {
        selected = [selected + '']
      }

      for (p in values) {
        if (values.hasOwnProperty(p)) {
          s = '<option value="' + (useName ? p : values[p]) + '"'
          if (selected && selected.indexOf((useName ? p : values[p])) !== -1) {
            s += ' selected="selected"'
          }
          s += '>' + output[useName ? p : i++] + '</option>'
          res.push(s)
        }
      }
      var name = params.__get('name', false)
      return (name ? ('<select name="' + name + '">\n' + res.join('\n') + '\n</select>') : res.join('\n')) + '\n'
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_radios',
    function (params, data) {
      params.type = 'radio'
      return this.plugins.html_checkboxes.process(params, data)
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_select_date',
    function (params, data) {
      var prefix = params.__get('prefix', 'Date_')
      var d = new Date()
      var startYear = Number(params.__get('start_year', d.getFullYear()))
      var endYear = Number(params.__get('end_year', startYear))
      var displayDays = params.__get('display_days', true)
      var displayMonths = params.__get('display_months', true)
      var displayYears = params.__get('display_years', true)
      var reverseYears = params.__get('reverse_years', false)
      var months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      var s = '<select name="' + prefix + 'Month">\n'
      var i = 0
      var selected

      if ((startYear > endYear && !reverseYears) || (startYear < endYear && reverseYears)) {
        var temp = endYear
        endYear = startYear
        startYear = temp
      }

      if (displayMonths) {
        for (i = 1; i < months.length; ++i) {
          selected = (i === (d.getMonth() + 1)) ? ' selected="selected"' : ''
          s += '<option value="' + i + '"' + selected + '>' + months[i] + '</option>\n'
        }
        s += '</select>\n'
      }

      if (displayDays) {
        s += '<select name="' + prefix + 'Day">\n'
        for (i = 1; i <= 31; ++i) {
          selected = (i === d.getDate()) ? ' selected="selected"' : ''
          s += '<option value="' + i + '"' + selected + '>' + i + '</option>\n'
        }
        s += '</select>\n'
      }

      if (displayYears) {
        var op = startYear > endYear ? -1 : 1
        s += '<select name="' + prefix + 'Year">\n'
        for (i = startYear; ((op > 0) ? (i <= endYear) : (i >= endYear)); i += op) {
          selected = (i === d.getFullYear()) ? ' selected="selected"' : ''
          s += '<option value="' + i + '"' + selected + '>' + i + '</option>\n'
        }
        s += '</select>\n'
      }

      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_table',
    function (params, data) {
      var rows = params.__get('rows', false)
      var cols = params.__get('cols', false)
      var inner = params.__get('inner', 'cols')
      var caption = params.__get('caption', '')
      var tableAttr = params.__get('table_attr', 'border="1"')
      var thAttr = params.__get('th_attr', false)
      var trAttr = params.__get('tr_attr', false)
      var tdAttr = params.__get('td_attr', false)
      var trailpad = params.__get('trailpad', '&nbsp;')
      var hdir = params.__get('hdir', 'right')
      var vdir = params.__get('vdir', 'down')
      var loop = []
      var p
      if (params.loop instanceof Array) {
        loop = params.loop
      } else {
        for (p in params.loop) {
          if (params.loop.hasOwnProperty(p)) {
            loop.push(params.loop[p])
          }
        }
      }

      if (!cols) {
        cols = rows ? Math.ceil(loop.length / rows) : 3
      }
      var colNames = []
      if (isNaN(cols)) {
        if (typeof cols === 'object') {
          for (p in cols) {
            if (cols.hasOwnProperty(p)) {
              colNames.push(cols[p])
            }
          }
        } else {
          colNames = cols.split(/\s*,\s*/)
        }
        cols = colNames.length
      }
      rows = rows || Math.ceil(loop.length / cols)

      if (thAttr && typeof thAttr !== 'object') {
        thAttr = [thAttr]
      }

      if (trAttr && typeof trAttr !== 'object') {
        trAttr = [trAttr]
      }

      if (tdAttr && typeof tdAttr !== 'object') {
        tdAttr = [tdAttr]
      }

      var s = ''
      var idx
      for (var row = 0; row < rows; ++row) {
        s += '<tr' + (trAttr ? ' ' + trAttr[row % trAttr.length] : '') + '>\n'
        for (var col = 0; col < cols; ++col) {
          idx = (inner === 'cols') ? ((vdir === 'down' ? row : rows - 1 - row) * cols + (hdir === 'right' ? col : cols - 1 - col)) : ((hdir === 'right' ? col : cols - 1 - col) * rows + (vdir === 'down' ? row : rows - 1 - row))
          s += '<td' + (tdAttr ? ' ' + tdAttr[col % tdAttr.length] : '') + '>' + (idx < loop.length ? loop[idx] : trailpad) + '</td>\n'
        }
        s += '</tr>\n'
      }

      var sHead = ''
      if (colNames.length) {
        sHead = '\n<thead><tr>'
        for (var i = 0; i < colNames.length; ++i) {
          sHead += '\n<th' + (thAttr ? ' ' + thAttr[i % thAttr.length] : '') + '>' + colNames[hdir === 'right' ? i : colNames.length - 1 - i] + '</th>'
        }
        sHead += '\n</tr></thead>'
      }

      return '<table ' + tableAttr + '>' + (caption ? '\n<caption>' + caption + '</caption>' : '') + sHead + '\n<tbody>\n' + s + '</tbody>\n</table>\n'
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'mailto',
    function (params, data) {
      var address = params.__get('address', null)
      var encode = params.__get('encode', 'none')
      var text = params.__get('text', address)
      var cc = phpJs.rawUrlEncode(params.__get('cc', '')).replace(/%40/g, '@').replace(/%2C/g, ',')
      var bcc = phpJs.rawUrlEncode(params.__get('bcc', '')).replace(/%40/g, '@').replace(/%2C/g, ',')
      var followupto = phpJs.rawUrlEncode(params.__get('followupto', '')).replace(/%40/g, '@').replace(/%2C/g, ',')
      var subject = phpJs.rawUrlEncode(params.__get('subject', ''))
      var newsgroups = phpJs.rawUrlEncode(params.__get('newsgroups', ''))
      var extra = params.__get('extra', '')
      var s
      var i

      address += (cc ? '?cc=' + cc : '')
      address += (bcc ? (cc ? '&' : '?') + 'bcc=' + bcc : '')
      address += (subject ? ((cc || bcc) ? '&' : '?') + 'subject=' + subject : '')
      address += (newsgroups ? ((cc || bcc || subject) ? '&' : '?') + 'newsgroups=' + newsgroups : '')
      address += (followupto ? ((cc || bcc || subject || newsgroups) ? '&' : '?') + 'followupto=' + followupto : '')

      s = '<a href="mailto:' + address + '" ' + extra + '>' + text + '</a>'

      if (encode === 'javascript') {
        s = "document.write('" + s + "');"
        var sEncoded = ''
        for (i = 0; i < s.length; ++i) {
          sEncoded += '%' + phpJs.bin2Hex(s.substr(i, 1))
        }
        return '<script type="text/javascript">eval(unescape(\'' + sEncoded + "'))</script>"
      } else if (encode === 'javascript_charcode') {
        var codes = []
        for (i = 0; i < s.length; ++i) {
          codes.push(phpJs.ord(s.substr(i, 1)))
        }
        return '<script type="text/javascript" language="javascript">\n<!--\n{document.write(String.fromCharCode(' + codes.join(',') + '))}\n//-->\n</script>\n'
      } else if (encode === 'hex') {
        if (address.match(/^.+\?.+$/)) {
          throw new Error('mailto: hex encoding does not work with extra attributes. Try javascript.')
        }
        var aEncoded = ''
        for (i = 0; i < address.length; ++i) {
          if (address.substr(i, 1).match(/\w/)) {
            aEncoded += '%' + phpJs.bin2Hex(address.substr(i, 1))
          } else {
            aEncoded += address.substr(i, 1)
          }
        }
        aEncoded = aEncoded.toLowerCase()
        var tEncoded = ''
        for (i = 0; i < text.length; ++i) {
          tEncoded += '&#x' + phpJs.bin2Hex(text.substr(i, 1)) + ';'
        }
        tEncoded = tEncoded.toLowerCase()
        return '<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;' + aEncoded + '" ' + extra + '>' + tEncoded + '</a>'
      }
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'math',
    function (params, data) {
      var equation = params.__get('equation', null).replace(/pi\(\s*\)/g, 'PI')
      equation = equation.replace(/ceil/g, 'Math.ceil')
        .replace(/abs/g, 'Math.abs')
        .replace(/cos/g, 'Math.cos')
        .replace(/exp/g, 'Math.exp')
        .replace(/floor/g, 'Math.floor')
        .replace(/log/g, 'Math.log')
        .replace(/max/g, 'Math.max')
        .replace(/min/g, 'Math.min')
        .replace(/PI/g, 'Math.PI')
        .replace(/pow/g, 'Math.pow')
        .replace(/rand/g, 'Math.rand')
        .replace(/round/g, 'Math.round')
        .replace(/sin/g, 'Math.sin')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/srans/g, 'Math.srans')
        .replace(/tan/g, 'Math.tan')

      var words = equation.match(/\w+/g)
      var i
      var j
      var tmp
      var banned = ['ceil', 'abs', 'cos', 'exp', 'floor', 'log10', 'log',
        'max', 'min', 'pi', 'pow', 'rand', 'round', 'sin', 'sqrt', 'srans', 'tan']

      for (i = 0; i < words.length; i++) {
        for (j = 0; j < (words.length - 1); j++) {
          if ((words[j] + '').length > (words[j + 1] + '').length) {
            tmp = words[j]
            words[j] = words[j + 1]
            words[j + 1] = tmp
          }
        }
      }

      for (i = 0; i < words.length; i++) {
        if (words[i] in params && banned.indexOf(words[i]) === -1) {
          equation = equation.replace(words[i], params[words[i]])
        }
      }
      var res = eval(equation) // eslint-disable-line no-eval

      if ('format' in params) {
        res = Number(phpJs.sprintf(params.format, res))
      }

      if ('assign' in params) {
        this.assignVar(params.assign, res, data)
        return ''
      }
      return res
    }
  )

  jSmart.prototype.registerPlugin(
    'block',
    'textformat',
    function (params, content, data, repeat) {
      if (!content) {
        return ''
      }

      content = String(content)

      var wrap = params.__get('wrap', 80)
      var wrapChar = params.__get('wrap_char', '\n')
      var wrapCut = params.__get('wrap_cut', false)
      var indentChar = params.__get('indent_char', ' ')
      var indent = params.__get('indent', 0)
      var indentStr = (new Array(indent + 1)).join(indentChar)
      var indentFirst = params.__get('indent_first', 0)
      var indentFirstStr = (new Array(indentFirst + 1)).join(indentChar)

      var style = params.__get('style', '')

      if (style === 'email') {
        wrap = 72
      }

      var paragraphs = content.split(/[\r\n]{2}/)
      for (var i = 0; i < paragraphs.length; ++i) {
        var p = paragraphs[i]
        if (!p) {
          continue
        }
        p = p.replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ')
        if (indentFirst > 0) {
          p = indentFirstStr + p
        }
        p = this.modifiers.wordwrap(p, wrap - indent, wrapChar, wrapCut)
        if (indent > 0) {
          p = p.replace(/^/mg, indentStr)
        }
        paragraphs[i] = p
      }
      var s = paragraphs.join(wrapChar + wrapChar)
      if ('assign' in params) {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )



  String.prototype.fetch = function (data) { // eslint-disable-line no-extend-native
    var template = new jSmart(this)
    return template.fetch(data)
  }

  return jSmart
})
