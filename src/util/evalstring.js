define(['util/evalstring'], function (EvalString) {

  function EvalString(s) {
    s.replace(/\\t/,'\t').replace(/\\n/,'\n').replace(/\\(['"\\])/g,'$1');
  }

  return EvalString;
});
