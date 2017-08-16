define(['./core', './util/findinarray'], function (jSmart, FindInArray) {

  jSmart.prototype.add({
    getActualParamValues: function (params, data) {
      var actualParams = [];
      for (var name in params.__parsed) {
        if (params.__parsed.hasOwnProperty(name)) {
          var v = this.process([params.__parsed[nm]], data);
          actualParams[name] = v;
        }
      }
      return actualParams;
    },

    buildInFunctions: {
      expression: {
        parse: function(s) {
          var tree = this.parseExpression(s);

          return {
            type: 'build-in',
            name: 'expression',
            // Expression expanded inside this sub tree.
            expression: tree,
            // TODO:: Derive parameters.
            params: [],
          };
        },
        process: function(node, data) {
          var params = this.getActualParamValues(node.params, data),
              res = this.process([node.expression], data);

          if (FindInArray(params, 'nofilter') < 0) {
            for (var i=0; i < this.defaultModifiers.length; ++i) {
              var m = this.defaultModifiers[i];
              m.params.__parsed[0] = {type: 'text', data: res};
              res = this.process([m],data);
            }
            if (this.escapeHtml) {
              res = modifiers.escape(res);
            }
            res = this.applyFilters(this.variableFilters, res);
          }
          return res;
        }
      }
    }
  });

  return jSmart;
});
