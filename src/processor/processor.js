define(['../util/findinarray', '../util/isemptyobject', '../util/countproperties', '../util/objectmerge', '../util/trimallquotes'], function (findInArray, isEmptyObject, countProperties, objectMerge, trimAllQuotes) {
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

  return jSmartProcessor
})
