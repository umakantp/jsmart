define(['jSmart'], function (jSmart) {
  describe('Test modifier:: unescape', function () {
    var tpl
    var output
    var t

    it('test unescape', function () {
      tpl = '{$text|unescape:"html"}'
      output = 'Germans use "&Uuml;mlauts" and pay in &euro;uro'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Germans use &quot;&Uuml;mlauts&quot; and pay in &euro;uro'})).toBe(output)
    })

    it('test unescape', function () {
      tpl = '{$text|unescape:"htmlall"}'
      output = 'Germans use "Ümlauts" and pay in €uro'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Germans use &quot;&Uuml;mlauts&quot; and pay in &euro;uro'})).toBe(output)
    })
  })
})
