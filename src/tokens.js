define(['./core'], function (jSmart) {

  jSmart.prototype.add({
    tokens: [
      {
        // Token for variable.
        'regex': /^\$([\w@]+)/,
        parse: function(s) {
          var data = this.parseVar.call(this, s, RegExp.$1);
          data[0]; // It has some modifiers
          // Return tree.
          return data[1];
        }
      }
    ]
  });

  return jSmart;
});
