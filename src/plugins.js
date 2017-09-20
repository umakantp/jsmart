define(['./core', './util/phpjs'], function (jSmart, phpJs) {
  'use strict'

  jSmart.prototype.registerPlugin(
    'modifier',
    'capitalize',
    function (s, upDigits, lcRest) {
      if (typeof s !== 'string') {
        return s
      }
      var re = new RegExp(upDigits ? '[^a-zA-Z_\u00E0-\u00FC]+' : '[^a-zA-Z0-9_\u00E0-\u00FC]')
      var found = null
      var res = ''
      if (lcRest) {
        s = s.toLowerCase()
      }
      var word
      for (found = s.match(re); found; found = s.match(re)) {
        word = s.slice(0, found.index)
        if (word.match(/\d/)) {
          res += word
        } else {
          res += word.charAt(0).toUpperCase() + word.slice(1)
        }
        res += s.slice(found.index, found.index + found[0].length)
        s = s.slice(found.index + found[0].length)
      }
      if (s.match(/\d/)) {
        return res + s
      }
      return res + s.charAt(0).toUpperCase() + s.slice(1)
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'cat',
    function (s, value) {
      value = value ? value : ''
      return String(s) + value
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

  jSmart.prototype.registerPlugin(
    'modifier',
    'count_paragraphs',
    function (s) {
      var found = String(s).match(/\n+/g)
      if (found) {
        return found.length + 1
      }
      return 1
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'count_sentences',
    function (s) {
      if (typeof s === 'string') {
        var found = s.match(/\w[.?!](\W|$)/g)
        if (found) {
          return found.length
        }
      }
      return 0
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'count_words',
    function (s) {
      if (typeof s === 'string') {
        var found = s.match(/\w+/g)
        if (found) {
          return found.length
        }
      }
      return 0
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'date_format',
    function (s, fmt, defaultDate) {
      return phpJs.strftime(fmt ? fmt : '%b %e, %Y', phpJs.makeTimeStamp(s ? s : defaultDate))
    }
  )

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
    'escape',
    function (s, escType, charSet, doubleEncode) {
      s = String(s)
      escType = escType || 'html'
      charSet = charSet || 'UTF-8'
      doubleEncode = (typeof doubleEncode !== 'undefined') ? Boolean(doubleEncode) : true
      var res = ''
      var i

      switch (escType) {
        case 'html': {
          if (doubleEncode) {
            s = s.replace(/&/g, '&amp;')
          }
          return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#039;').replace(/"/g, '&quot;')
        }
        case 'htmlall': {
          return phpJs.htmlEntities(s, 3, charSet)
        }
        case 'url': {
          return phpJs.rawUrlEncode(s)
        }
        case 'urlpathinfo': {
          return phpJs.rawUrlEncode(s).replace(/%2F/g, '/')
        }
        case 'quotes': {
          return s.replace(/(^|[^\\])'/g, "$1\\'")
        }
        case 'hex': {
          res = ''
          for (i = 0; i < s.length; ++i) {
            res += '%' + phpJs.bin2Hex(s.substr(i, 1)).toLowerCase()
          }
          return res
        }
        case 'hexentity': {
          res = ''
          for (i = 0; i < s.length; ++i) {
            res += '&#x' + phpJs.bin2Hex(s.substr(i, 1)) + ';'
          }
          return res
        }
        case 'decentity': {
          res = ''
          for (i = 0; i < s.length; ++i) {
            res += '&#' + phpJs.ord(s.substr(i, 1)) + ';'
          }
          return res
        }
        case 'mail': {
          return s.replace(/@/g, ' [AT] ').replace(/[.]/g, ' [DOT] ')
        }
        case 'nonstd': {
          res = ''
          for (i = 0; i < s.length; ++i) {
            var _ord = phpJs.ord(s.substr(i, 1))
            if (_ord >= 126) {
              res += '&#' + _ord + ';'
            } else {
              res += s.substr(i, 1)
            }
          }
          return res
        }
        case 'javascript': {
          return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/<\//g, '</')
        }
      }
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'from_charset',
    function (s) {
      // No implementation in JS. But modifier should not fail hencce this.
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'indent',
    function (s, repeat, indentWith) {
      s = String(s)
      repeat = repeat ? repeat : 4
      indentWith = indentWith ? indentWith : ' '

      var indentStr = ''
      while (repeat--) {
        indentStr += indentWith
      }

      var tail = s.match(/\n+$/)
      return indentStr + s.replace(/\n+$/, '').replace(/\n/g, '\n' + indentStr) + (tail ? tail[0] : '')
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
    'nl2br',
    function (s) {
      return String(s).replace(/\n/g, '<br />')
    }
  )

  // only modifiers (flags) 'i' and 'm' are supported
  // backslashes should be escaped e.g. \\s
  jSmart.prototype.registerPlugin(
    'modifier',
    'regex_replace',
    function (s, re, replaceWith) {
      var pattern = re.match(/^ *\/(.*)\/(.*) *$/)
      return String(s).replace(new RegExp(pattern[1], 'g' + (pattern.length > 1 ? pattern[2] : '')), replaceWith)
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
    'spacify',
    function (s, space) {
      if (!space) {
        space = ' '
      }
      return String(s).replace(/(\n|.)(?!$)/g, '$1' + space)
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'string_format',
    function (s, fmt) {
      return phpJs.sprintf(fmt, s)
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'strip',
    function (s, replaceWith) {
      replaceWith = replaceWith ? replaceWith : ' '
      return String(s).replace(/[\s]+/g, replaceWith)
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'strip_tags',
    function (s, addSpaceOrTagsToExclude, tagsToExclude) {
      if (addSpaceOrTagsToExclude === null) {
        addSpaceOrTagsToExclude = true
      }
      if (!tagsToExclude) {
        if (addSpaceOrTagsToExclude !== true && addSpaceOrTagsToExclude !== false && ((addSpaceOrTagsToExclude + '').length > 0)) {
          tagsToExclude = addSpaceOrTagsToExclude
          addSpaceOrTagsToExclude = true
        }
      }
      if (tagsToExclude) {
        var filters = tagsToExclude.split('>')
        filters.splice(-1, 1)
        s = String(s).replace(/<[^>]*?>/g, function (match, offset, contents) {
          var tagName = match.match(/\w+/)
          for (var i = 0; i < filters.length; i++) {
            var tagName2 = (filters[i] + '>').match(/\w+/)
            if (tagName[0] === tagName2[0]) {
              return match
            }
          }
          return addSpaceOrTagsToExclude ? ' ' : ''
        })
        return s
      }
      return String(s).replace(/<[^>]*?>/g, addSpaceOrTagsToExclude ? ' ' : '')
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'to_charset',
    function (s) {
      // No implementation in JS. But modifier should not fail hencce this.
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'truncate',
    function (s, length, etc, breakWords, middle) {
      s = String(s)
      length = length ? length : 80
      etc = (etc != null) ? etc : '...'

      if (s.length <= length) {
        return s
      }

      length -= Math.min(length, etc.length)
      if (middle) {
        // one of floor()'s should be replaced with ceil() but it so in Smarty
        return s.slice(0, Math.floor(length / 2)) + etc + s.slice(s.length - Math.floor(length / 2))
      }

      if (!breakWords) {
        s = s.slice(0, length + 1).replace(/\s+?(\S+)?$/, '')
      }

      return s.slice(0, length) + etc
    }
  )

  jSmart.prototype.registerPlugin(
    'modifier',
    'unescape',
    function (s, escType, charSet) {
      s = String(s)
      escType = escType || 'html'
      charSet = charSet || 'UTF-8'

      switch (escType) {
        case 'html': {
          return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"')
        }
        case 'entity': {
          return phpJs.htmlEntityDecode(s, 1)
        }
        case 'htmlall': {
          return phpJs.htmlEntityDecode(s, 1)
        }
        case 'url': {
          return phpJs.rawUrlDecode(s)
        }
      }
      return s
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
    'wordwrap',
    function (s, width, wrapWith, breakWords) {
      width = width || 80
      wrapWith = wrapWith || '\n'

      var lines = String(s).split('\n')
      for (var i = 0; i < lines.length; ++i) {
        var line = lines[i]
        var parts = ''
        while (line.length > width) {
          var pos = 0
          var found = line.slice(pos).match(/\s+/)
          for (; found && (pos + found.index) <= width; found = line.slice(pos).match(/\s+/)) {
            pos += found.index + found[0].length
          }
          pos = (breakWords ? (width - 1) : (pos || (found ? found.index + found[0].length : line.length)))
          parts += line.slice(0, pos).replace(/\s+$/, '')
          if (pos < line.length) {
            parts += wrapWith
          }
          line = line.slice(pos)
        }
        lines[i] = parts + line
      }
      return lines.join('\n')
    }
  )

  return jSmart
})
