define(function () {
  function evalString (s) {
    return s.replace(/\\t/, '\t').replace(/\\n/, '\n').replace(/\\(['"\\])/g, '$1')
  }

  return evalString
})
