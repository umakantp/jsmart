define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: ldelim rdelim', function () {
    var tpl
    var output
    var t

    it('test simple ldelim-rdelim', function () {
      // Simple
      tpl = '{ldelim}function{rdelim} prints left and right delimiters'
      output = '{function} prints left and right delimiters'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test delimiter local', function () {
      tpl = '{{ldelim}}function{{rdelim}} prints {test} left and right delimiters'
      output = '{{function}} prints {test} left and right delimiters'
      t = new jSmart(tpl, {ldelim: '{{', rdelim: '}}'})
      expect(t.fetch()).toBe(output)
    })

    it('test delimiter global and backword compatible', function () {
      jSmart.prototype.left_delimiter = '{{{'
      jSmart.prototype.right_delimiter = '}}}'
      tpl = '{{{ldelim}}}function{{{rdelim}}} prints {test} left and right delimiters'
      output = '{{{function}}} prints {test} left and right delimiters'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
      // Reset global by removing them
      jSmart.prototype.left_delimiter = null
      jSmart.prototype.right_delimiter = null
    })
  })
})
