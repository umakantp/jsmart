define(function () {
  'use strict'

  function objectMerge (ob1, ob2 /* , ... */) {
    for (var i = 1; i < arguments.length; ++i) {
      for (var name in arguments[i]) {
        ob1[name] = arguments[i][name]
      }
    }
    return ob1
  }

  return objectMerge
})
