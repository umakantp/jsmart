define(['jSmart'], function (jSmart) {
  describe('Test modifier:: from_charset', function () {
    var tpl
    var output
    var t

    it('test from_charset', function () {
      // modifier should not break amything.
      // we do not support this.
      tpl = '{$articleTitle|from_charset}'
      output = 'Dealers Will Hear Car Talk at Noon.'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: 'Dealers Will Hear Car Talk at Noon.'})).toBe(output)
    })
  })
})
