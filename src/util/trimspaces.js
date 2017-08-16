define(function () {
  // Trim spaces
  function TrimSpaces(s) {
    return s.replace(/^\s+|\s+$/g, '');
  }

  return TrimSpaces;
});
