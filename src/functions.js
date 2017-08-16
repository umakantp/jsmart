define(['./core'], function (jSmart) {

  jSmart.prototype.add({
    buildInFunctions: {
      expression: {
        parse: function(s) {
            var e = this.parseExpression(s);

            return {
                type: 'build-in',
                name: 'expression',
                expression: e.tree,
                params: this.parseParams(s.slice(e.value.length).replace(/^\s+|\s+$/g,''))
            };
        }
      }
    }
  });

  return jSmart;
});
