define(['../util/findinarray', '../util/isemptyobject', '../util/countproperties'], function (FindInArray, IsEmptyObject, CountProperties) {

  // Processor object. Plain object which just does processing.
  var jSmartProcessor = {

    // jSmart object used for current processing.
    jSmart: {},

    // Object which is copy of jSmart.smarty for local modification.
    smarty: {},

    // Process the tree and return the data.
    getProcessed: function (tree, data, that) {
      // Copy the jSmart object, so we could use it while processing.
      this.jSmart = that;
      // Create a copy of smarty object, as we modify that data and
      // we want to keep a copy rather than modifying original jSmart object.
      ObjectMerge(this.smarty, that.smarty);

      // Process the tree and get the output.
      var output = this.process(tree, data),
          smarty = this.smarty;
      // Empty parser objects. Clean up.
      // We do not want old data held up here.
      this.jSmart = {};
      this.smarty = {};
      return {
        output: output,
        smarty: smarty
      };
    },

    // Process the tree and apply data.
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
		    } else if (node.type == 'boolean') {
          s = node.data ? '1' : '';
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
        res += ((s!==null) ? s : '');
      }
      return res;
    },

    getActualParamValues: function (params, data) {
      var actualParams = [];
      for (var name in params.__parsed) {
        if (params.__parsed.hasOwnProperty(name)) {
          var v = this.process([params.__parsed[name]], data);
          actualParams[name] = v;
        }
      }
      actualParams.__get = function(name, defVal, id) {
        if (name in actualParams && typeof(actualParams[name]) != 'undefined') {
          return actualParams[name];
        }
        if (typeof(id)!='undefined' && typeof(actualParams[id]) != 'undefined') {
          return actualParams[id];
        }
        if (defVal === null) {
          throw new Error("The required attribute '"+name+"' is missing");
        }
        return defVal;
      };
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

          // Section Name
          if (name in this.smarty.section && part.type=='text' && (this.process([node.parts[0]], data) != 'smarty')) {
            name = this.smarty.section[name].index;
          }

          // Add to array
          if (!name && typeof val != 'undefined' && v instanceof Array) {
            name = v.length;
          }

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

    // TODO:: Remove this duplicate function.
    // Apply the filters to template.
    applyFilters: function(filters, tpl) {
      for (var i=0; i<filters.length; ++i) {
        tpl = filters[i](tpl);
      }
      return tpl;
    },

    buildInFunctions: {
      expression: {
        process: function(node, data) {
          var params = this.getActualParamValues(node.params, data),
              res = this.process([node.expression], data);

          if (FindInArray(params, 'nofilter') < 0) {
            for (var i=0; i < this.jSmart.defaultModifiers.length; ++i) {
              var m = this.jSmart.defaultModifiers[i];
              m.params.__parsed[0] = {type: 'text', data: res};
              res = this.process([m],data);
            }
            if (this.jSmart.escapeHtml) {
              res = modifiers.escape(res);
            }
            res = this.applyFilters(this.jSmart.globalAndDefaultFilters, res);
          }
          return res;
        }
      },

      operator: {
  		  process: function(node, data) {
          var params = this.getActualParamValues(node.params, data);
    		  var arg1 = params[0];

    		  if (node.optype == 'binary') {
    			  var arg2 = params[1];
      			if (node.op == '=') {
              // TODO:: why do not we return the var value?
      				this.getVarValue(node.params.__parsed[0], data, arg2);
              return '';
      			} else if (node.op.match(/(\+=|-=|\*=|\/=|%=)/)) {
      				arg1 = getVarValue(node.params.__parsed[0], data);
      				switch (node.op) {
      				  case '+=': {
                  arg1+=arg2;
                  break;
                }
      				  case '-=':
                  arg1-=arg2;
                  break;

                case '*=':
                  arg1*=arg2;
                  break;

                case '/=':
                  arg1/=arg2;
                  break;
                case '%=':
                  arg1%=arg2;
                  break;
              }
              return this.getVarValue(node.params.__parsed[0], data, arg1);
            } else if (node.op.match(/div/)) {
              return (node.op != 'div')^(arg1%arg2==0);
            } else if (node.op.match(/even/)) {
              return (node.op != 'even')^((arg1/arg2)%2==0);
            } else if (node.op.match(/xor/)) {
              return (arg1 || arg2) && !(arg1 && arg2);
            }

            switch (node.op) {
              case '==': return arg1==arg2;
              case '!=': return arg1!=arg2;
              case '+':  return Number(arg1)+Number(arg2);
              case '-':  return Number(arg1)-Number(arg2);
              case '*':  return Number(arg1)*Number(arg2);
              case '/':  return Number(arg1)/Number(arg2);
              case '%':  return Number(arg1)%Number(arg2);
              case '&&': return arg1&&arg2;
              case '||': return arg1||arg2;
              case '<':  return arg1<arg2;
              case '<=': return arg1<=arg2;
              case '>':  return arg1>arg2;
              case '>=': return arg1>=arg2;
              case '===': return arg1===arg2;
              case '!==': return arg1!==arg2;
            }
          } else if (node.op == '!') {
            return !arg1;
          } else {
            var isVar = node.params.__parsed[0].type == 'var';
            if (isVar) {
              arg1 = this.getVarValue(node.params.__parsed[0], data);
            }
            var v = arg1;
            if (node.optype == 'pre-unary') {
              switch (node.op) {
                case '-':  v=-arg1;  break;
                case '++': v=++arg1; break;
                case '--': v=--arg1; break;
              }
              if (isVar) {
                this.getVarValue(node.params.__parsed[0], data, arg1);
              }
            } else {
              switch (node.op) {
                case '++': arg1++; break;
                case '--': arg1--; break;
              }
              this.getVarValue(node.params.__parsed[0], data, arg1);
            }
            return v;
          }
        }
      },

      section: {
        process: function(node, data) {
          var params = this.getActualParamValues(node.params, data);

          var props = {};
          this.smarty.section[params.__get('name', null, 0)] = props;

          var show = params.__get('show', true);
          props.show = show;
          if (!show) {
            return this.process(node.subTreeElse, data);
          }

          var from = parseInt(params.__get('start', 0));
          var to = (params.loop instanceof Object) ? CountProperties(params.loop) : isNaN(params.loop) ? 0 : parseInt(params.loop);
          var step = parseInt(params.__get('step', 1));
          var max = parseInt(params.__get('max'));
          if (isNaN(max)) {
            max = Number.MAX_VALUE;
          }

          if (from < 0) {
            from += to;
            if (from < 0) {
              from = 0;
            }
          } else if (from >= to) {
            from = to ? to-1 : 0;
          }

          var count = 0;
          var loop = 0;
          var i = from;
          for (; ((i >= 0) && (i < to) && (count < max)); i+=step, ++count) {
            loop = i;
          }
          props.total = count;
          props.loop = count;  //? - because it is so in Smarty

          count = 0;
          var s = '';
          for (i=from; i>=0 && i<to && count<max; i+=step,++count) {
            if (this.smarty['break']) {
              break;
            }

            props.first = (i==from);
            props.last = ((i+step)<0 || (i+step)>=to);
            props.index = i;
            props.index_prev = i-step;
            props.index_next = i+step;
            props.iteration = props.rownum = count+1;

            s += this.process(node.subTree, data);
            this.smarty['continue'] = false;
          }
          this.smarty['break'] = false;

          if (count) {
            return s;
          }
          return this.process(node.subTreeElse, data);
        }
      },

      'if': {
        process: function(node, data) {
          var value = this.getActualParamValues(node.params, data)[0];
          // Zero length arrays or empty associative arrays are false in PHP.
          if (value && !((value instanceof Array && value.length == 0)
            || (typeof value == 'object' && IsEmptyObject(value)))
          ) {
            return this.process(node.subTreeIf, data);
          } else {
            return this.process(node.subTreeElse, data);
          }
        }
      }
    }
  };

  return jSmartProcessor;
});
