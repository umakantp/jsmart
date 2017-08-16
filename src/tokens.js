define(['./core'], function (jSmart) {

  jSmart.prototype.add({
    tokens: [
      {
        // Token for variable.
        'regex': /^\$([\w@]+)/,
        parse: function(s) {
          var dataVar = this.parseVar.call(this, s, RegExp.$1);
          var dataMod = this.parseModifiers.call(this, dataVar.s, dataVar.tree);

          dataVar.value = dataMod.value;
          return dataMod.tree;
        }
      }
    ]
  });

  return jSmart;
});
