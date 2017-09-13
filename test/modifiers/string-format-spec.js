define(['jSmart'], function (jSmart) {
  describe('Test modifier:: string_format', function () {
    var tpl
    var output
    var t

    it('test string_format', function () {
      tpl = "{$number|string_format:'%.2f'}"
      output = '23.58'
      t = new jSmart(tpl)
      expect(t.fetch({number: 23.5787446})).toBe(output)
    })

    it('test string_format', function () {
      tpl = "{$number|string_format:'%d'}"
      output = '23'
      t = new jSmart(tpl)
      expect(t.fetch({number: 23.5787446})).toBe(output)
    })
  })
})
