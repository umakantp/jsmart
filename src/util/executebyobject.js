define(function () {
  /**
   * Execute function when we have a object.
   *
   * @param object obj  Object of the function to be called.
   * @param array  args Arguments to pass to a function.
   *
   * @return
   * @throws Error If function obj does not exists.
   */
  function ExecuteByFuncObject(obj, args) {
    try {
      if (args) {
        return obj.apply(this, args);
      }
      return obj.apply(this);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  return ExecuteByFuncObject;
});
