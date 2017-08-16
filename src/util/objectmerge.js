define(function () {
  function ObjectMerge(ob1, ob2 /*, ...*/) {
    for (var i=1; i<arguments.length; ++i) {
      for (var nm in arguments[i]) {
        ob1[nm] = arguments[i][nm];
      }
    }
    return ob1;
  }

  return ObjectMerge;
});
