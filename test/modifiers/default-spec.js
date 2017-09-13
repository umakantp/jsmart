define(['jSmart'], function (jSmart) {
  describe('Test modifier:: default', function () {
    var tpl
    var output
    var t

    it('test default', function () {
      tpl = "{$articleTitle|default:'no title'} {$myTitle|default:'no title'}"
      output = 'Dealers Will Hear Car Talk at Noon. no title'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: 'Dealers Will Hear Car Talk at Noon.'})).toBe(output)
    })
  })
})
