define(['jSmart'], function (jSmart) {
  describe('Test custom function:: math', function () {
    var tpl
    var output
    var t

    it('test math', function () {
      tpl = '{math equation="x + y" x=5 y=10}'
      output = 15
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      tpl = '{math equation="x * y" x=$x y=$y}'
      output = 50
      t = new jSmart(tpl)
      expect(t.fetch({x: 5, y: 10})).toBe(output)

      tpl = '{math equation="(( x + y ) / z )" x=2 y=10 z=2}'
      output = 6
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      tpl = '{math equation="x + y" x=4.4444 y=5.0000 format="%.2f"}'
      output = 9.44
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      tpl = '{math equation="x + xx" xx=10 x=5}'
      output = 15
      t = new jSmart(tpl)
      expect(t.fetch({x: 5, y: 10})).toBe(output)

      tpl = '{math equation="ceil(4.9)"}'
      output = 5
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
