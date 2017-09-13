define(['jSmart'], function (jSmart) {
  describe('Test modifier:: to_charset', function () {
    var tpl
    var output
    var t

    it('test to_charset', function () {
      // modifier should not break amything.
      // we do not support this.
      tpl = '{$articleTitle|to_charset}'
      output = 'Dealers Will Hear Car Talk at Noon.'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: 'Dealers Will Hear Car Talk at Noon.'})).toBe(output)
    })
  })
})
