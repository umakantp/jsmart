define(function () {
  'use strict'

  function countProperties (ob) {
    var count = 0
    for (var name in ob) {
      if (Object.prototype.hasOwnProperty.call(ob, name)) {
        count++
      }
    }
    return count
  }

  return countProperties
})
