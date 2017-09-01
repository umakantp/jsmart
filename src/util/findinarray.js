define(function () {
  'use strict'

  // Find in array.
  function findInArray (arr, val) {
    if (Array.prototype.indexOf) {
      return arr.indexOf(val)
    }
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === val) {
        return i
      }
    }
    return -1
  }

  return findInArray
})
