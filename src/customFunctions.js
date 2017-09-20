define(['./core', './util/phpjs'], function (jSmart, phpJs) {
  // All built in but custom functions

  jSmart.prototype.registerPlugin(
    'function',
    'counter',
    function (params, data) {
      var name = params.__get('name', 'default')
      if (name in data.smarty.counter) {
        var counter = data.smarty.counter[name]
        if ('start' in params) {
          counter.value = parseInt(params['start'], 10)
        } else {
          counter.value = parseInt(counter.value, 10)
          counter.skip = parseInt(counter.skip, 10)
          if (counter.direction === 'down') {
            counter.value -= counter.skip
          } else {
            counter.value += counter.skip
          }
        }
        counter.skip = params.__get('skip', counter.skip)
        counter.direction = params.__get('direction', counter.direction)
        counter.assign = params.__get('assign', counter.assign)
        data.smarty.counter[name] = counter
      } else {
        data.smarty.counter[name] = {
          value: parseInt(params.__get('start', 1), 10),
          skip: parseInt(params.__get('skip', 1), 10),
          direction: params.__get('direction', 'up'),
          assign: params.__get('assign', false)
        }
      }
      if (data.smarty.counter[name].assign) {
        data[data.smarty.counter[name].assign] = data.smarty.counter[name].value
        return ''
      }
      if (params.__get('print', true)) {
        return data.smarty.counter[name].value
      }
      // User didn't assign and also said, print false.
      return ''
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'cycle',
    function (params, data) {
      var name = params.__get('name', 'default')
      var reset = params.__get('reset', false)
      if (!(name in data.smarty.cycle)) {
        data.smarty.cycle[name] = {arr: [''], delimiter: params.__get('delimiter', ','), index: 0}
        reset = true
      }

      if (params.__get('delimiter', false)) {
        data.smarty.cycle[name].delimiter = params.delimiter
      }
      var values = params.__get('values', false)
      if (values) {
        var arr = []
        if (values instanceof Object) {
          for (var nm in values) {
            arr.push(values[nm])
          }
        } else {
          arr = values.split(data.smarty.cycle[name].delimiter)
        }

        if (arr.length !== data.smarty.cycle[name].arr.length || arr[0] !== data.smarty.cycle[name].arr[0]) {
          data.smarty.cycle[name].arr = arr
          data.smarty.cycle[name].index = 0
          reset = true
        }
      }

      if (params.__get('advance', 'true')) {
        data.smarty.cycle[name].index += 1
      }
      if (data.smarty.cycle[name].index >= data.smarty.cycle[name].arr.length || reset) {
        data.smarty.cycle[name].index = 0
      }

      if (params.__get('assign', false)) {
        this.assignVar(params.assign, data.smarty.cycle[name].arr[data.smarty.cycle[name].index], data)
        return ''
      }

      if (params.__get('print', true)) {
        return data.smarty.cycle[name].arr[data.smarty.cycle[name].index]
      }

      return ''
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'eval',
    function (params, data) {
      var s = params.var
      if ('assign' in params) {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'fetch',
    function (params, data) {
      var s = jSmart.prototype.getFile(params.__get('file', null, 0))
      if ('assign' in params) {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_checkboxes',
    function (params, data) {
      var type = params.__get('type', 'checkbox')
      var name = params.__get('name', type)
      var realName = name
      var values = params.__get('values', params.options)
      var output = params.__get('options', [])
      var useName = ('options' in params)
      var selected = params.__get('selected', false)
      var separator = params.__get('separator', '')
      var labels = Boolean(params.__get('labels', true))
      var labelIds = Boolean(params.__get('label_ids', false))
      var p
      var res = []
      var i = 0
      var s = ''
      var value
      var id

      if (type === 'checkbox') {
        name += '[]'
      }

      if (!useName) {
        for (p in params.output) {
          output.push(params.output[p])
        }
      }

      for (p in values) {
        if (values.hasOwnProperty(p)) {
          value = (useName ? p : values[p])
          id = realName + '_' + value
          s = (labels ? (labelIds ? '<label for="' + id + '">' : '<label>') : '')
          s += '<input type="' + type + '" name="' + name + '" value="' + value + '" '
          if (labelIds) {
            s += 'id="' + id + '" '
          }
          if (selected == (useName ? p : values[p])) { // eslint-disable-line eqeqeq
            s += 'checked="checked" '
          }
          s += '/>' + output[useName ? p : i++]
          s += (labels ? '</label>' : '')
          s += separator
          res.push(s)
        }
      }

      if ('assign' in params) {
        this.assignVar(params.assign, res, data)
        return ''
      }
      return res.join('\n')
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_image',
    function (params, data) {
      var url = params.__get('file', null)
      var width = params.__get('width', false)
      var height = params.__get('height', false)
      var alt = params.__get('alt', '')
      var href = params.__get('href', params.__get('link', false))
      var pathPrefix = params.__get('path_prefix', '')
      var paramNames = {file: 1, width: 1, height: 1, alt: 1, href: 1, basedir: 1, pathPrefix: 1, link: 1}
      var s = '<img src="' + pathPrefix + url + '"' + ' alt="' + alt + '"' + (width ? ' width="' + width + '"' : '') + (height ? ' height="' + height + '"' : '')
      var p

      for (p in params) {
        if (params.hasOwnProperty(p) && typeof params[p] === 'string') {
          if (!(p in paramNames)) {
            s += ' ' + p + '="' + params[p] + '"'
          }
        }
      }
      s += ' />'
      return href ? '<a href="' + href + '">' + s + '</a>' : s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_options',
    function (params, data) {
      var values = params.__get('values', params.options)
      var output = params.__get('options', [])
      var useName = ('options' in params)
      var p
      if (!useName) {
        for (p in params.output) {
          output.push(params.output[p])
        }
      }
      var selected = params.__get('selected', false)
      var res = []
      var s = ''
      var i = 0
      var j
      if (selected instanceof Array) {
        // We convert each value of array to string because values
        // is array of string. Otherwise comparision fails.
        for (j in selected) {
          if (selected.hasOwnProperty(j)) {
            selected[j] = selected[j] + ''
          }
        }
      } else if (typeof selected !== 'boolean') {
        selected = [selected + '']
      }

      for (p in values) {
        if (values.hasOwnProperty(p)) {
          s = '<option value="' + (useName ? p : values[p]) + '"'
          if (selected && selected.indexOf((useName ? p : values[p])) !== -1) {
            s += ' selected="selected"'
          }
          s += '>' + output[useName ? p : i++] + '</option>'
          res.push(s)
        }
      }
      var name = params.__get('name', false)
      return (name ? ('<select name="' + name + '">\n' + res.join('\n') + '\n</select>') : res.join('\n')) + '\n'
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_radios',
    function (params, data) {
      params.type = 'radio'
      return this.plugins.html_checkboxes.process(params, data)
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_select_date',
    function (params, data) {
      var prefix = params.__get('prefix', 'Date_')
      var d = new Date()
      var startYear = Number(params.__get('start_year', d.getFullYear()))
      var endYear = Number(params.__get('end_year', startYear))
      var displayDays = params.__get('display_days', true)
      var displayMonths = params.__get('display_months', true)
      var displayYears = params.__get('display_years', true)
      var reverseYears = params.__get('reverse_years', false)
      var months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      var s = '<select name="' + prefix + 'Month">\n'
      var i = 0
      var selected

      if ((startYear > endYear && !reverseYears) || (startYear < endYear && reverseYears)) {
        var temp = endYear
        endYear = startYear
        startYear = temp
      }

      if (displayMonths) {
        for (i = 1; i < months.length; ++i) {
          selected = (i === (d.getMonth() + 1)) ? ' selected="selected"' : ''
          s += '<option value="' + i + '"' + selected + '>' + months[i] + '</option>\n'
        }
        s += '</select>\n'
      }

      if (displayDays) {
        s += '<select name="' + prefix + 'Day">\n'
        for (i = 1; i <= 31; ++i) {
          selected = (i === d.getDate()) ? ' selected="selected"' : ''
          s += '<option value="' + i + '"' + selected + '>' + i + '</option>\n'
        }
        s += '</select>\n'
      }

      if (displayYears) {
        var op = startYear > endYear ? -1 : 1
        s += '<select name="' + prefix + 'Year">\n'
        for (i = startYear; ((op > 0) ? (i <= endYear) : (i >= endYear)); i += op) {
          selected = (i === d.getFullYear()) ? ' selected="selected"' : ''
          s += '<option value="' + i + '"' + selected + '>' + i + '</option>\n'
        }
        s += '</select>\n'
      }

      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'html_table',
    function (params, data) {
      var rows = params.__get('rows', false)
      var cols = params.__get('cols', false)
      var inner = params.__get('inner', 'cols')
      var caption = params.__get('caption', '')
      var tableAttr = params.__get('table_attr', 'border="1"')
      var thAttr = params.__get('th_attr', false)
      var trAttr = params.__get('tr_attr', false)
      var tdAttr = params.__get('td_attr', false)
      var trailpad = params.__get('trailpad', '&nbsp;')
      var hdir = params.__get('hdir', 'right')
      var vdir = params.__get('vdir', 'down')
      var loop = []
      var p
      if (params.loop instanceof Array) {
        loop = params.loop
      } else {
        for (p in params.loop) {
          if (params.loop.hasOwnProperty(p)) {
            loop.push(params.loop[p])
          }
        }
      }

      if (!cols) {
        cols = rows ? Math.ceil(loop.length / rows) : 3
      }
      var colNames = []
      if (isNaN(cols)) {
        if (typeof cols === 'object') {
          for (p in cols) {
            if (cols.hasOwnProperty(p)) {
              colNames.push(cols[p])
            }
          }
        } else {
          colNames = cols.split(/\s*,\s*/)
        }
        cols = colNames.length
      }
      rows = rows ? rows : Math.ceil(loop.length / cols)

      if (thAttr && typeof thAttr !== 'object') {
        thAttr = [thAttr]
      }

      if (trAttr && typeof trAttr !== 'object') {
        trAttr = [trAttr]
      }

      if (tdAttr && typeof tdAttr !== 'object') {
        tdAttr = [tdAttr]
      }

      var s = ''
      var idx
      for (var row = 0; row < rows; ++row) {
        s += '<tr' + (trAttr ? ' ' + trAttr[row % trAttr.length] : '') + '>\n'
        for (var col = 0; col < cols; ++col) {
          idx = (inner === 'cols') ? ((vdir === 'down' ? row : rows - 1 - row) * cols + (hdir === 'right' ? col : cols - 1 - col)) : ((hdir === 'right' ? col : cols - 1 - col) * rows + (vdir === 'down' ? row : rows - 1 - row))
          s += '<td' + (tdAttr ? ' ' + tdAttr[col % tdAttr.length] : '') + '>' + (idx < loop.length ? loop[idx] : trailpad) + '</td>\n'
        }
        s += '</tr>\n'
      }

      var sHead = ''
      if (colNames.length) {
        sHead = '\n<thead><tr>'
        for (var i = 0; i < colNames.length; ++i) {
          sHead += '\n<th' + (thAttr ? ' ' + thAttr[i % thAttr.length] : '') + '>' + colNames[hdir === 'right' ? i : colNames.length - 1 - i] + '</th>'
        }
        sHead += '\n</tr></thead>'
      }

      return '<table ' + tableAttr + '>' + (caption ? '\n<caption>' + caption + '</caption>' : '') + sHead + '\n<tbody>\n' + s + '</tbody>\n</table>\n'
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'mailto',
    function (params, data) {
      var address = params.__get('address', null)
      var encode = params.__get('encode', 'none')
      var text = params.__get('text', address)
      var cc = phpJs.rawUrlEncode(params.__get('cc', '')).replace(/%40/g, '@').replace(/%2C/g, ',')
      var bcc = phpJs.rawUrlEncode(params.__get('bcc', '')).replace(/%40/g, '@').replace(/%2C/g, ',')
      var followupto = phpJs.rawUrlEncode(params.__get('followupto', '')).replace(/%40/g, '@').replace(/%2C/g, ',')
      var subject = phpJs.rawUrlEncode(params.__get('subject', ''))
      var newsgroups = phpJs.rawUrlEncode(params.__get('newsgroups', ''))
      var extra = params.__get('extra', '')
      var s
      var i

      address += (cc ? '?cc=' + cc : '')
      address += (bcc ? (cc ? '&' : '?') + 'bcc=' + bcc : '')
      address += (subject ? ((cc || bcc) ? '&' : '?') + 'subject=' + subject : '')
      address += (newsgroups ? ((cc || bcc || subject) ? '&' : '?') + 'newsgroups=' + newsgroups : '')
      address += (followupto ? ((cc || bcc || subject || newsgroups) ? '&' : '?') + 'followupto=' + followupto : '')

      s = '<a href="mailto:' + address + '" ' + extra + '>' + text + '</a>'

      if (encode === 'javascript') {
        s = "document.write('" + s + "');"
        var sEncoded = ''
        for (i = 0; i < s.length; ++i) {
          sEncoded += '%' + phpJs.bin2Hex(s.substr(i, 1))
        }
        return '<script type="text/javascript">eval(unescape(\'' + sEncoded + "'))</script>"
      } else if (encode === 'javascript_charcode') {
        var codes = []
        for (i = 0; i < s.length; ++i) {
          codes.push(phpJs.ord(s.substr(i, 1)))
        }
        return '<script type="text/javascript" language="javascript">\n<!--\n{document.write(String.fromCharCode(' + codes.join(',') + '))}\n//-->\n</script>\n'
      } else if (encode === 'hex') {
        if (address.match(/^.+\?.+$/)) {
          throw new Error('mailto: hex encoding does not work with extra attributes. Try javascript.')
        }
        var aEncoded = ''
        for (i = 0; i < address.length; ++i) {
          if (address.substr(i, 1).match(/\w/)) {
            aEncoded += '%' + phpJs.bin2Hex(address.substr(i, 1))
          } else {
            aEncoded += address.substr(i, 1)
          }
        }
        aEncoded = aEncoded.toLowerCase()
        var tEncoded = ''
        for (i = 0; i < text.length; ++i) {
          tEncoded += '&#x' + phpJs.bin2Hex(text.substr(i, 1)) + ';'
        }
        tEncoded = tEncoded.toLowerCase()
        return '<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;' + aEncoded + '" ' + extra + '>' + tEncoded + '</a>'
      }
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'math',
    function (params, data) {
      var equation = params.__get('equation', null).replace(/pi\(\s*\)/g, 'PI')
      equation = equation.replace(/ceil/g, 'Math.ceil')
        .replace(/abs/g, 'Math.abs')
        .replace(/cos/g, 'Math.cos')
        .replace(/exp/g, 'Math.exp')
        .replace(/floor/g, 'Math.floor')
        .replace(/log/g, 'Math.log')
        .replace(/max/g, 'Math.max')
        .replace(/min/g, 'Math.min')
        .replace(/PI/g, 'Math.PI')
        .replace(/pow/g, 'Math.pow')
        .replace(/rand/g, 'Math.rand')
        .replace(/round/g, 'Math.round')
        .replace(/sin/g, 'Math.sin')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/srans/g, 'Math.srans')
        .replace(/tan/g, 'Math.tan')

      var words = equation.match(/\w+/g)
      var i
      var j
      var tmp
      var banned = ['ceil', 'abs', 'cos', 'exp', 'floor', 'log10', 'log',
        'max', 'min', 'pi', 'pow', 'rand', 'round', 'sin', 'sqrt', 'srans', 'tan']

      for (i = 0; i < words.length; i++) {
        for (j = 0; j < (words.length - 1); j++) {
          if ((words[j] + '').length > (words[j + 1] + '').length) {
            tmp = words[j]
            words[j] = words[j + 1]
            words[j + 1] = tmp
          }
        }
      }

      for (i = 0; i < words.length; i++) {
        if (words[i] in params && banned.indexOf(words[i]) === -1) {
          equation = equation.replace(words[i], params[words[i]])
        }
      }
      var res = eval(equation) // eslint-disable-line no-eval

      if ('format' in params) {
        res = Number(phpJs.sprintf(params.format, res))
      }

      if ('assign' in params) {
        this.assignVar(params.assign, res, data)
        return ''
      }
      return res
    }
  )

  jSmart.prototype.registerPlugin(
    'block',
    'textformat',
    function (params, content, data, repeat) {
      if (!content) {
        return ''
      }

      content = String(content)

      var wrap = params.__get('wrap', 80)
      var wrapChar = params.__get('wrap_char', '\n')
      var wrapCut = params.__get('wrap_cut', false)
      var indentChar = params.__get('indent_char', ' ')
      var indent = params.__get('indent', 0)
      var indentStr = (new Array(indent + 1)).join(indentChar)
      var indentFirst = params.__get('indent_first', 0)
      var indentFirstStr = (new Array(indentFirst + 1)).join(indentChar)

      var style = params.__get('style', '')

      if (style === 'email') {
        wrap = 72
      }

      var paragraphs = content.split(/[\r\n]{2}/)
      for (var i = 0; i < paragraphs.length; ++i) {
        var p = paragraphs[i]
        if (!p) {
          continue
        }
        p = p.replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ')
        if (indentFirst > 0) {
          p = indentFirstStr + p
        }
        p = this.modifiers.wordwrap(p, wrap - indent, wrapChar, wrapCut)
        if (indent > 0) {
          p = p.replace(/^/mg, indentStr)
        }
        paragraphs[i] = p
      }
      var s = paragraphs.join(wrapChar + wrapChar)
      if ('assign' in params) {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )

  return jSmart
})
