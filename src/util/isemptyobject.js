define(function () {
  'use strict'

  /**
   * Returns boolean true if object is empty otherwise false.
   *
   * @param object hash Object you are testing against.
   *
   * @return boolean
   */
  function isEmptyObject (hash) {
    for (var i in hash) {
      if (Object.prototype.hasOwnProperty.call(hash, i)) {
        return false
      }
    }
    return true
  }

  return isEmptyObject
})
