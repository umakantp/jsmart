define(['./gethtmltranslationtable'], function (getHtmlTranslationTable) {
  'use strict'

  var phpJs = {
    // Copied from http://locutus.io/php/strings/ord/
    ord: function (string) {
      var str = string + ''
      var code = str.charCodeAt(0)
      if (code >= 0xD800 && code <= 0xDBFF) {
        var hi = code
        if (str.length === 1) {
          return code
        }
        var low = str.charCodeAt(1)
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000
      }
      if (code >= 0xDC00 && code <= 0xDFFF) {
        return code
      }
      return code
    },

    // Copied from http://locutus.io/php/strings/bin2hex/
    bin2Hex: function (s) {
      var i
      var l
      var o = ''
      var n
      s += ''
      for (i = 0, l = s.length; i < l; i++) {
        n = s.charCodeAt(i).toString(16)
        o += n.length < 2 ? '0' + n : n
      }
      return o
    },

    // Copied from http://locutus.io/php/strings/html_entity_decode/
    htmlEntityDecode: function (string, quoteStyle) {
      var tmpStr = string.toString()
      var entity = ''
      var symbol = ''
      var hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
      if (hashMap === false) {
        return false
      }
      delete (hashMap['&'])
      hashMap['&'] = '&amp;'
      for (symbol in hashMap) {
        entity = hashMap[symbol]
        tmpStr = tmpStr.split(entity).join(symbol)
      }
      tmpStr = tmpStr.split('&#039;').join("'")
      return tmpStr
    },

    objectKeys: function (o) {
      var k = []
      var p
      for (p in o) {
        if (Object.prototype.hasOwnProperty.call(o, p)) {
          k.push(p)
        }
      }
      return k
    },

    htmlEntities: function (string, quoteStyle, charset, doubleEncode) {
      var hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
      var keys
      string = string === null ? '' : string + ''
      if (!hashMap) {
        return false
      }

      if (quoteStyle && quoteStyle === 'ENT_QUOTES') {
        hashMap["'"] = '&#039;'
      }
      doubleEncode = doubleEncode === null || !!doubleEncode
      keys = Object.keys ? Object.keys(hashMap) : phpJs.objectKeys(hashMap)
      var regex = new RegExp('&(?:#\\d+|#x[\\da-f]+|[a-zA-Z][\\da-z]*);|[' +
        keys.join('')
          .replace(/([()[\]{}\-.*+?^$|/\\])/g, '\\$1') + ']', 'g')

      return string.replace(regex, function (ent) {
        if (ent.length > 1) {
          return doubleEncode ? hashMap['&'] + ent.substr(1) : ent
        }
        return hashMap[ent]
      })
    },

    rawUrlDecode: function (string) {
      return decodeURIComponent((string + '').replace(/%(?![\da-f]{2})/gi, function () {
        // PHP tolerates poorly formed escape sequences
        return '%25'
      }))
    },

    rawUrlEncode: function (string) {
      string = (string + '')
      return encodeURIComponent(string)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
    },

    sprintf: function () {
      var regex = /%%|%(\d+\$)?([-+'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g
      var a = arguments
      var i = 0
      var format = a[i++]

      var _pad = function (str, len, chr, leftJustify) {
        if (!chr) {
          chr = ' '
        }
        var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
        return leftJustify ? str + padding : padding + str
      }

      var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length
        if (diff > 0) {
          if (leftJustify || !zeroPad) {
            value = _pad(value, minWidth, customPadChar, leftJustify)
          } else {
            value = [
              value.slice(0, prefix.length),
              _pad('', diff, '0', true),
              value.slice(prefix.length)
            ].join('')
          }
        }
        return value
      }

      var _formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0
        prefix = (prefix && number && {
          '2': '0b',
          '8': '0',
          '16': '0x'
        }[base]) || ''
        value = prefix + _pad(number.toString(base), precision || 0, '0', false)
        return justify(value, prefix, leftJustify, minWidth, zeroPad)
      }

      // _formatString()
      var _formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision !== null && precision !== undefined) {
          value = value.slice(0, precision)
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar)
      }

      // doFormat()
      var doFormat = function (substring, valueIndex, flags, minWidth, precision, type) {
        var number, prefix, method, textTransform, value

        if (substring === '%%') {
          return '%'
        }

        // parse flags
        var leftJustify = false
        var positivePrefix = ''
        var zeroPad = false
        var prefixBaseX = false
        var customPadChar = ' '
        var flagsl = flags.length
        var j
        for (j = 0; j < flagsl; j++) {
          switch (flags.charAt(j)) {
            case ' ':
              positivePrefix = ' '
              break
            case '+':
              positivePrefix = '+'
              break
            case '-':
              leftJustify = true
              break
            case "'":
              customPadChar = flags.charAt(j + 1)
              break
            case '0':
              zeroPad = true
              customPadChar = '0'
              break
            case '#':
              prefixBaseX = true
              break
          }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
          minWidth = 0
        } else if (minWidth === '*') {
          minWidth = +a[i++]
        } else if (minWidth.charAt(0) === '*') {
          minWidth = +a[minWidth.slice(1, -1)]
        } else {
          minWidth = +minWidth
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
          minWidth = -minWidth
          leftJustify = true
        }

        if (!isFinite(minWidth)) {
          throw new Error('sprintf: (minimum-)width must be finite')
        }

        if (!precision) {
          precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined
        } else if (precision === '*') {
          precision = +a[i++]
        } else if (precision.charAt(0) === '*') {
          precision = +a[precision.slice(1, -1)]
        } else {
          precision = +precision
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++]

        switch (type) {
          case 's':
            return _formatString(value + '', leftJustify, minWidth, precision, zeroPad, customPadChar)
          case 'c':
            return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad)
          case 'b':
            return _formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'o':
            return _formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'x':
            return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'X':
            return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase()
          case 'u':
            return _formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'i':
          case 'd':
            number = +value || 0
            // Plain Math.round doesn't just truncate
            number = Math.round(number - number % 1)
            prefix = number < 0 ? '-' : positivePrefix
            value = prefix + _pad(String(Math.abs(number)), precision, '0', false)
            return justify(value, prefix, leftJustify, minWidth, zeroPad)
          case 'e':
          case 'E':
          case 'f': // @todo: Should handle locales (as per setlocale)
          case 'F':
          case 'g':
          case 'G':
            number = +value
            prefix = number < 0 ? '-' : positivePrefix
            method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())]
            textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2]
            value = prefix + Math.abs(number)[method](precision)
            return phpJs.justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]()
          default:
            return substring
        }
      }

      return format.replace(regex, doFormat)
    },

    makeTimeStamp: function (s) {
      if (!s) {
        return Math.floor(new Date().getTime() / 1000)
      }
      if (isNaN(s)) {
        var tm = phpJs.strtotime(s)
        if (tm === -1 || tm === false) {
          return Math.floor(new Date().getTime() / 1000)
        }
        return tm
      }
      s = s + ''
      if (s.length === 14 && s.search(/^[\d]+$/g) !== -1) {
        // it is mysql timestamp format of YYYYMMDDHHMMSS?
        return phpJs.mktime(s.substr(8, 2), s.substr(10, 2), s.substr(12, 2), s.substr(4, 2), s.substr(6, 2), s.substr(0, 4))
      }
      return Number(s)
    },

    mktime: function () {
      var d = new Date()
      var r = arguments
      var i = 0
      var e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear']

      for (i = 0; i < e.length; i++) {
        if (typeof r[i] === 'undefined') {
          r[i] = d['get' + e[i]]()
          // +1 to fix JS months.
          r[i] += (i === 3)
        } else {
          r[i] = parseInt(r[i], 10)
          if (isNaN(r[i])) {
            return false
          }
        }
      }

      r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0)
      d.setFullYear(r[5], r[3] - 1, r[4])
      d.setHours(r[0], r[1], r[2])
      var time = d.getTime()
      return (time / 1e3 >> 0) - (time < 0)
    },

    _pad: function (str, len, chr, leftJustify) {
      if (!chr) {
        chr = ' '
      }
      var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
      return leftJustify ? str + padding : padding + str
    },

    justify: function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
      var diff = minWidth - value.length
      if (diff > 0) {
        if (leftJustify || !zeroPad) {
          value = phpJs._pad(value, minWidth, customPadChar, leftJustify)
        } else {
          value = [
            value.slice(0, prefix.length),
            phpJs._pad('', diff, '0', true),
            value.slice(prefix.length)
          ].join('')
        }
      }
      return value
    },

    strtotime: function (text, now) {
      var parsed
      var match
      var today
      var year
      var date
      var days
      var ranges
      var len
      var times
      var regex
      var i
      var fail = false

      if (!text) {
        return fail
      }

      text = text.replace(/^\s+|\s+$/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/[\t\r\n]/g, '')
        .toLowerCase()

      var pattern = new RegExp([
        '^(\\d{1,4})',
        '([\\-\\.\\/:])',
        '(\\d{1,2})',
        '([\\-\\.\\/:])',
        '(\\d{1,4})',
        '(?:\\s(\\d{1,2}):(\\d{2})?:?(\\d{2})?)?',
        '(?:\\s([A-Z]+)?)?$'
      ].join(''))
      match = text.match(pattern)

      if (match && match[2] === match[4]) {
        if (match[1] > 1901) {
          switch (match[2]) {
            case '-':
              // YYYY-M-D
              if (match[3] > 12 || match[5] > 31) {
                return fail
              }

              return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '.':
              // YYYY.M.D is not parsed by strtotime()
              return fail
            case '/':
              // YYYY/M/D
              if (match[3] > 12 || match[5] > 31) {
                return fail
              }

              return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
          }
        } else if (match[5] > 1901) {
          switch (match[2]) {
            case '-':
              // D-M-YYYY
              if (match[3] > 12 || match[1] > 31) {
                return fail
              }

              return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '.':
              // D.M.YYYY
              if (match[3] > 12 || match[1] > 31) {
                return fail
              }

              return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '/':
              // M/D/YYYY
              if (match[1] > 12 || match[3] > 31) {
                return fail
              }

              return new Date(match[5], parseInt(match[1], 10) - 1, match[3],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
          }
        } else {
          switch (match[2]) {
            case '-':
              // YY-M-D
              if (match[3] > 12 || match[5] > 31 || (match[1] < 70 && match[1] > 38)) {
                return fail
              }

              year = match[1] >= 0 && match[1] <= 38 ? +match[1] + 2000 : match[1]
              return new Date(year, parseInt(match[3], 10) - 1, match[5],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case '.':
              // D.M.YY or H.MM.SS
              if (match[5] >= 70) {
                // D.M.YY
                if (match[3] > 12 || match[1] > 31) {
                  return fail
                }

                return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                  match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
              }
              if (match[5] < 60 && !match[6]) {
                // H.MM.SS
                if (match[1] > 23 || match[3] > 59) {
                  return fail
                }

                today = new Date()
                return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                  match[1] || 0, match[3] || 0, match[5] || 0, match[9] || 0) / 1000
              }

              // invalid format, cannot be parsed
              return fail
            case '/':
              // M/D/YY
              if (match[1] > 12 || match[3] > 31 || (match[5] < 70 && match[5] > 38)) {
                return fail
              }

              year = match[5] >= 0 && match[5] <= 38 ? +match[5] + 2000 : match[5]
              return new Date(year, parseInt(match[1], 10) - 1, match[3],
                match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
            case ':':
              // HH:MM:SS
              if (match[1] > 23 || match[3] > 59 || match[5] > 59) {
                return fail
              }

              today = new Date()
              return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                match[1] || 0, match[3] || 0, match[5] || 0) / 1000
          }
        }
      }

      if (text === 'now') {
        return now === null || isNaN(now)
          ? new Date().getTime() / 1000 | 0
          : now | 0
      }

      if (!isNaN(parsed = Date.parse(text))) {
        return parsed / 1000 | 0
      }

      pattern = new RegExp([
        '^([0-9]{4}-[0-9]{2}-[0-9]{2})',
        '[ t]',
        '([0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]+)?)',
        '([\\+-][0-9]{2}(:[0-9]{2})?|z)'
      ].join(''))
      match = text.match(pattern)
      if (match) {
        // @todo: time zone information
        if (match[4] === 'z') {
          match[4] = 'Z'
        } else if (match[4].match(/^([+-][0-9]{2})$/)) {
          match[4] = match[4] + ':00'
        }

        if (!isNaN(parsed = Date.parse(match[1] + 'T' + match[2] + match[4]))) {
          return parsed / 1000 | 0
        }
      }

      date = now ? new Date(now * 1000) : new Date()
      days = {
        'sun': 0,
        'mon': 1,
        'tue': 2,
        'wed': 3,
        'thu': 4,
        'fri': 5,
        'sat': 6
      }
      ranges = {
        'yea': 'FullYear',
        'mon': 'Month',
        'day': 'Date',
        'hou': 'Hours',
        'min': 'Minutes',
        'sec': 'Seconds'
      }

      function lastNext (type, range, modifier) {
        var diff
        var day = days[range]

        if (typeof day !== 'undefined') {
          diff = day - date.getDay()

          if (diff === 0) {
            diff = 7 * modifier
          } else if (diff > 0 && type === 'last') {
            diff -= 7
          } else if (diff < 0 && type === 'next') {
            diff += 7
          }

          date.setDate(date.getDate() + diff)
        }
      }

      function process (val) {
        var splt = val.split(' ')
        var type = splt[0]
        var range = splt[1].substring(0, 3)
        var typeIsNumber = /\d+/.test(type)
        var ago = splt[2] === 'ago'
        var num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1)

        if (typeIsNumber) {
          num *= parseInt(type, 10)
        }

        if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) {
          return date['set' + ranges[range]](date['get' + ranges[range]]() + num)
        }

        if (range === 'wee') {
          return date.setDate(date.getDate() + (num * 7))
        }

        if (type === 'next' || type === 'last') {
          lastNext(type, range, num)
        } else if (!typeIsNumber) {
          return false
        }

        return true
      }

      times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' +
        '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' +
        '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)'
      regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?'

      match = text.match(new RegExp(regex, 'gi'))
      if (!match) {
        return fail
      }

      for (i = 0, len = match.length; i < len; i++) {
        if (!process(match[i])) {
          return fail
        }
      }

      return (date.getTime() / 1000)
    },

    strftime: function (fmt, timestamp) {
      var _xPad = function (x, pad, r) {
        if (typeof r === 'undefined') {
          r = 10
        }
        for (; parseInt(x, 10) < r && r > 1; r /= 10) {
          x = pad.toString() + x
        }
        return x.toString()
      }

      // Only english
      var lcTime = {
        a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        // ABDAY_
        A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        // DAY_
        b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        // ABMON_
        B: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
          'August', 'September', 'October',
          'November', 'December'
        ],
        // MON_
        c: '%a %d %b %Y %r %Z',
        // D_T_FMT // changed %T to %r per results
        p: ['AM', 'PM'],
        // AM_STR/PM_STR
        P: ['am', 'pm'],
        // Not available in nl_langinfo()
        r: '%I:%M:%S %p',
        // T_FMT_AMPM (Fixed for all locales)
        x: '%m/%d/%Y',
        // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
        X: '%r',
        // T_FMT // changed from %T to %r  (%T is default for C, not English US)
        // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
        alt_digits: '',
        // e.g., ordinal
        ERA: '',
        ERA_YEAR: '',
        ERA_D_T_FMT: '',
        ERA_D_FMT: '',
        ERA_T_FMT: ''
      }

      var _formats = {
        a: function (d) {
          return lcTime.a[d.getDay()]
        },
        A: function (d) {
          return lcTime.A[d.getDay()]
        },
        b: function (d) {
          return lcTime.b[d.getMonth()]
        },
        B: function (d) {
          return lcTime.B[d.getMonth()]
        },
        C: function (d) {
          return _xPad(parseInt(d.getFullYear() / 100, 10), 0)
        },
        d: ['getDate', '0'],
        e: ['getDate', ' '],
        g: function (d) {
          return _xPad(parseInt(this.G(d) / 100, 10), 0) // eslint-disable-line new-cap
        },
        G: function (d) {
          var y = d.getFullYear()
          var V = parseInt(_formats.V(d), 10) // eslint-disable-line new-cap
          var W = parseInt(_formats.W(d), 10) // eslint-disable-line new-cap

          if (W > V) {
            y++
          } else if (W === 0 && V >= 52) {
            y--
          }

          return y
        },
        H: ['getHours', '0'],
        I: function (d) {
          var I = d.getHours() % 12
          return _xPad(I === 0 ? 12 : I, 0)
        },
        j: function (d) {
          var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT')
          // Line differs from Yahoo implementation which would be
          // equivalent to replacing it here with:
          ms += d.getTimezoneOffset() * 60000
          var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1
          return _xPad(doy, 0, 100)
        },
        k: ['getHours', '0'],
        // not in PHP, but implemented here (as in Yahoo)
        l: function (d) {
          var l = d.getHours() % 12
          return _xPad(l === 0 ? 12 : l, ' ')
        },
        m: function (d) {
          return _xPad(d.getMonth() + 1, 0)
        },
        M: ['getMinutes', '0'],
        p: function (d) {
          return lcTime.p[d.getHours() >= 12 ? 1 : 0]
        },
        P: function (d) {
          return lcTime.P[d.getHours() >= 12 ? 1 : 0]
        },
        s: function (d) {
          // Yahoo uses return parseInt(d.getTime()/1000, 10);
          return Date.parse(d) / 1000
        },
        S: ['getSeconds', '0'],
        u: function (d) {
          var dow = d.getDay()
          return ((dow === 0) ? 7 : dow)
        },
        U: function (d) {
          var doy = parseInt(_formats.j(d), 10)
          var rdow = 6 - d.getDay()
          var woy = parseInt((doy + rdow) / 7, 10)
          return _xPad(woy, 0)
        },
        V: function (d) {
          var woy = parseInt(_formats.W(d), 10) // eslint-disable-line new-cap
          var dow11 = (new Date('' + d.getFullYear() + '/1/1')).getDay()
          // First week is 01 and not 00 as in the case of %U and %W,
          // so we add 1 to the final result except if day 1 of the year
          // is a Monday (then %W returns 01).
          // We also need to subtract 1 if the day 1 of the year is
          // Friday-Sunday, so the resulting equation becomes:
          var idow = woy + (dow11 > 4 || dow11 <= 1 ? 0 : 1)
          if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4) {
            idow = 1
          } else if (idow === 0) {
            idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31')) // eslint-disable-line new-cap
          }
          return _xPad(idow, 0)
        },
        w: 'getDay',
        W: function (d) {
          var doy = parseInt(_formats.j(d), 10)
          var rdow = 7 - _formats.u(d)
          var woy = parseInt((doy + rdow) / 7, 10)
          return _xPad(woy, 0, 10)
        },
        y: function (d) {
          return _xPad(d.getFullYear() % 100, 0)
        },
        Y: 'getFullYear',
        z: function (d) {
          var o = d.getTimezoneOffset()
          var H = _xPad(parseInt(Math.abs(o / 60), 10), 0)
          var M = _xPad(o % 60, 0)
          return (o > 0 ? '-' : '+') + H + M
        },
        Z: function (d) {
          return d.toString().replace(/^.*\(([^)]+)\)$/, '$1')
        },
        '%': function (d) {
          return '%'
        }
      }

      var _date = (typeof timestamp === 'undefined')
        ? new Date()
        : (timestamp instanceof Date)
          ? new Date(timestamp)
          : new Date(timestamp * 1000)

      var _aggregates = {
        c: 'locale',
        D: '%m/%d/%y',
        F: '%y-%m-%d',
        h: '%b',
        n: '\n',
        r: 'locale',
        R: '%H:%M',
        t: '\t',
        T: '%H:%M:%S',
        x: 'locale',
        X: 'locale'
      }

      // First replace aggregates (run in a loop because an agg may be made up of other aggs)
      while (fmt.match(/%[cDFhnrRtTxX]/)) {
        fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function (m0, m1) {
          var f = _aggregates[m1]
          return (f === 'locale' ? lcTime[m1] : f)
        })
      }

      // Now replace formats - we need a closure so that the date object gets passed through
      var str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function (m0, m1) {
        var f = _formats[m1]
        if (typeof f === 'string') {
          return _date[f]()
        } else if (typeof f === 'function') {
          return f(_date)
        } else if (typeof f === 'object' && typeof f[0] === 'string') {
          return _xPad(_date[f[0]](), f[1])
        } else {
          // Shouldn't reach here
          return m1
        }
      })

      return str
    }
  }

  return phpJs
})
