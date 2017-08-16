define(['./core', './util/findinarray'], function (jSmart, FindInArray) {

  jSmart.prototype.add({
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
            res = this.applyFilters(this.globalAndDefaultFilters, res);
          }
          return res;
        }
      }
    }
  });

  return jSmart;
});
