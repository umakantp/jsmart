define(function () {

  function EvalString(s) {
    return s.replace(/\\t/,'\t').replace(/\\n/,'\n').replace(/\\(['"\\])/g,'$1');
  }

  return EvalString;
});
