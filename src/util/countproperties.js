define(function () {

  function CountProperties(ob) {
    var count = 0;
    for (var name in ob) {
      if (ob.hasOwnProperty(name)) {
        count++;
      }
    }
    return count;
  }

  return CountProperties;
});
