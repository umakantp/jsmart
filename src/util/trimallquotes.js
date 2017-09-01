define(['util/evalstring'], function (evalString) {
  // Trim all quotes.
  function trimAllQuotes (s) {
    return evalString(s.replace(/^['"](.*)['"]$/, '$1')).replace(/^\s+|\s+$/g, '')
  }

  return trimAllQuotes
})
