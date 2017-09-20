define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: setfilter', function () {
    var tpl
    var output
    var t

    it('test simple setfilter', function () {
      // Simple
      tpl = '{setfilter upper} {$var1} {/setfilter}'
      output = ' HELLO WORLD '
      t = new jSmart(tpl)
      expect(t.fetch({
        var1: 'Hello World'
      })).toBe(output)
    })

    it('test nested setfilter', function () {
      // Simple
      tpl = '{setfilter upper} {$var1} {setfilter lower} {$var2} {/setfilter} {$var3} {/setfilter}'
      output = ' HELLO WORLD  hello world  HELLO WORLD '
      t = new jSmart(tpl)
      expect(t.fetch({
        var1: 'Hello World',
        var2: 'Hello World',
        var3: 'Hello World'
      })).toBe(output)
    })
  })
})
