define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: for', function () {
    it('test simple for', function () {
      var tpl
      var output
      var t

      // Simple
      tpl = '{for $foo=1 to 3}'
      tpl += '{$foo}'
      tpl += '{/for}'
      output = '123'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test max attr of for', function () {
      var tpl
      var output
      var t

      tpl = '{for $foo=4 to $to max=3}'
      tpl += '{$foo}'
      tpl += '{/for}'
      output = '456'
      t = new jSmart(tpl)
      expect(t.fetch({to: 10})).toBe(output)
    })

    it('test forelse', function () {
      var tpl
      var output
      var t

      tpl = '{for $foo=$from to $to}'
      tpl += '{$foo}'
      tpl += '{forelse}'
      tpl += 'no iteration'
      tpl += '{/for}'
      output = 'no iteration'
      t = new jSmart(tpl)
      expect(t.fetch({from: 10, to: 5})).toBe(output)
    })

    it('test nested for', function () {
      var tpl
      var output
      var t

      tpl = '{for $foo=1 to 4}'
      tpl += '{$foo}'
      tpl += '{for $bar=$foo to 10 max=2}'
      tpl += '{$bar}'
      tpl += '{/for}'
      tpl += '{/for}'
      output = '112223334445'
      t = new jSmart(tpl)
      expect(t.fetch({from: 10, to: 5})).toBe(output)
    })
  })
})
