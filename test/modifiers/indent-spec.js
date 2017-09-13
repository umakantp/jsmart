define(['jSmart'], function (jSmart) {
  describe('Test modifier:: indent', function () {
    var tpl
    var output
    var t

    it('test indent', function () {
      tpl = '{$articleTitle|indent}'
      output = '    Dealers Will Hear Car Talk at Noon.\n'
      output += '    Yo works'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: 'Dealers Will Hear Car Talk at Noon.\nYo works'})).toBe(output)
    })

    it('test indent', function () {
      tpl = '{$articleTitle|indent:10}'
      output = '          Dealers Will Hear Car Talk at Noon.\n'
      output += '          Yo works'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: 'Dealers Will Hear Car Talk at Noon.\nYo works'})).toBe(output)
    })

    it('test indent', function () {
      tpl = "{$articleTitle|indent:2:'\t'}"
      output = '\t\tDealers Will Hear Car Talk at Noon.\n'
      output += '\t\tYo works'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: 'Dealers Will Hear Car Talk at Noon.\nYo works'})).toBe(output)
    })
  })
})
