define(['./core'], function (jSmart) {

  jSmart.prototype.registerPlugin(
    'modifier',
    'upper',
    function(s) {
      return (new String(s)).toUpperCase();
    }
  );

  jSmart.prototype.registerPlugin(
    'modifier',
    'lower',
    function(s) {
      return (new String(s)).toLowerCase();
    }
  );

  return jSmart;
});
