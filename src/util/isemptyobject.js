define(function () {
  /**
   * Returns boolean true if object is empty otherwise false.
   *
   * @param object hash Object you are testing against.
   *
   * @return boolean
   */
  function IsEmptyObject(hash) {
    for (var i in hash) {
      if (hash.hasOwnProperty(i)) {
        return false;
      }
    }
    return true;
  }

  return IsEmptyObject;
});
