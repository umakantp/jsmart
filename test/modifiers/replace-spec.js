define(['jSmart'], function (jSmart) {
  describe('Test modifier:: replace', function () {
    var tpl
    var output
    var t

    it('test replace', function () {
      tpl = '{$articleTitle|replace:"Infertility":"Intelligence"}'
      output = 'Intelligence unlikely to be passed on, experts say.'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: 'Infertility unlikely to be passed on, experts say.'})).toBe(output)
    })
  })
})
