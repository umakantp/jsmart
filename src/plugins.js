define(['./core'], function (jSmart) {
  jSmart.prototype.registerPlugin(
    'modifier',
    'defaultValue',
    function (s, value) {
      value = value || ''
      return (s && s !== 'null' && typeof s !== 'undefined') ? s : value
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'upper',
    function (s) {
      return (String(s)).toUpperCase()
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'lower',
    function (s) {
      return (String(s)).toLowerCase()
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'replace',
    function (s, search, replaceWith) {
      if (!search) {
        return s
      }
      s = String(s)
      search = String(search)
      replaceWith = String(replaceWith)
      var res = ''
      var pos = -1
      for (pos = s.indexOf(search); pos >= 0; pos = s.indexOf(search)) {
        res += s.slice(0, pos) + replaceWith
        pos += search.length
        s = s.slice(pos)
      }
      return res + s
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'count_characters',
    function (s, includeWhitespaces) {
      s = String(s)
      return includeWhitespaces ? s.length : s.replace(/\s/g, '').length
    }
  )

  return jSmart
})
