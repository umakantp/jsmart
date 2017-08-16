define(['util/evalstring'], function (EvalString) {
  // Trim all quotes.
  function TrimAllQuotes(s) {
    return EvalString(s.replace(/^['"](.*)['"]$/,'$1')).replace(/^\s+|\s+$/g,'');
  }

  return TrimAllQuotes;
});
