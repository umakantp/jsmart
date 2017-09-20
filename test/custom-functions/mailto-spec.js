define(['jSmart'], function (jSmart) {
  describe('Test custom function:: mailto', function () {
    var tpl
    var output
    var t

    it('test mailto', function () {
      tpl = '{mailto address="me@example.com"}'
      output = '<a href="mailto:me@example.com" >me@example.com</a>'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      tpl = '{mailto address="me@example.com" text="send me some mail"}'
      output = '<a href="mailto:me@example.com" >send me some mail</a>'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      /*
      big strings to test
      tpl = '{mailto address="me@example.com" encode="javascript"}'
      output = '<script type="text/javascript" language="javascript">'
      output += "eval(unescape('%64%6f% ... snipped ...%61%3e%27%29%3b'))"
      output += '</script>'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      tpl = '{mailto address="me@example.com" encode="hex"}'
      output = '<a href="mailto:%6d%65.. snipped..3%6f%6d">&#x6d;&..snipped...#x6f;&#x6d;</a>'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output) */

      tpl = '{mailto address="me@example.com" subject="Hello to you!"}'
      output = '<a href="mailto:me@example.com?subject=Hello%20to%20you%21" >me@example.com</a>'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      tpl = '{mailto address="me@example.com" cc="you@example.com,they@example.com"}'
      output = '<a href="mailto:me@example.com?cc=you@example.com,they@example.com" >me@example.com</a>'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      tpl = '{mailto address="me@example.com" extra=\'class="email"\'}'
      output = '<a href="mailto:me@example.com" class="email">me@example.com</a>'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      tpl = '{mailto address="me@example.com" encode="javascript_charcode"}'
      output = '<script type="text/javascript" language="javascript">\n'
      output += '<!--\n'
      output += '{document.write(String.fromCharCode(60,97,32,104,114,101,102,61,34,109,97,105,108,116,111,58,109,101,64,101,120,97,109,112,108,101,46,99,111,109,34,32,62,109,101,64,101,120,97,109,112,108,101,46,99,111,109,60,47,97,62))}\n'
      output += '//-->\n'
      output += '</script>\n'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
