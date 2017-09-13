define(['jSmart'], function (jSmart) {
  describe('Test modifier:: nl2br', function () {
    var tpl
    var output
    var t

    it('test nl2br', function () {
      tpl = '{$words|nl2br}'
      output = 'Sun or rain expected<br />today, dark tonight'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Sun or rain expected\ntoday, dark tonight'})).toBe(output)
    })
  })
})
