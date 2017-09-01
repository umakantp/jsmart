define(function () {
  'use strict'

  function countProperties (ob) {
    var count = 0
    for (var name in ob) {
      if (ob.hasOwnProperty(name)) {
        count++
      }
    }
    return count
  }

  return countProperties
})
