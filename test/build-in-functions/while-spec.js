define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: while', function () {
    var tpl
    var output
    var t

    it('test simple while', function () {
      // Simple
      tpl = '{while $fooTest > 0}'
      tpl += '{$fooTest--}'
      tpl += '{/while}{$fooTest}'
      output = '543210'
      t = new jSmart(tpl)
      expect(t.fetch({fooTest: 5})).toBe(output)
    })

    it('test break tag in while', function () {
      // Simple
      tpl = '{while $fooTest > 0}'
      tpl += '{$fooTest}'
      tpl += '{$fooTest--}'
      tpl += '{break}'
      tpl += '{/while}{$fooTest}'
      output = '554'
      t = new jSmart(tpl)
      expect(t.fetch({fooTest: 5})).toBe(output)
    })
  })
})
