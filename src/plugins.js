define(['./core'], function (jSmart) {

  jSmart.prototype.registerPlugin(
    'modifier',
    'upper',
    function(s) {
      return (new String(s)).toUpperCase();
    }
  );

  return jSmart;
});
