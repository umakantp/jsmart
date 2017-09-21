define(['../util/objectmerge', '../util/trimallquotes', '../util/evalstring', '../util/findinarray'], function (objectMerge, trimAllQuotes, evalString, findInArray) {
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
      this.usedExtends = false
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

      if (this.usedExtends > 0) {
        var tmpTree = []
        // Now in the tree remove anything other than block after extends
        for (var i = 0; i < tree.length; i++) {
          if (i < this.usedExtends) {
            tmpTree.push(tree[i])
          } else if (tree[i].type === 'build-in' && (tree[i].name === 'block')) {
            tmpTree.push(tree[i])
          }
        }
        tree = tmpTree
      }

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
                this.usedExtends = tree.length
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

  return jSmartParser
})
