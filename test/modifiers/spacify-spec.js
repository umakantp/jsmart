define(['jSmart'], function (jSmart) {
  describe('Test modifier:: spacify', function () {
    var tpl
    var output
    var t

    it('test spacify', function () {
      tpl = '{$articleTitle|spacify}'
      output = 'I t   w o r k s   h o p e f u l l y'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: 'It works hopefully'})).toBe(output)
    })

    it('test spacify', function () {
      tpl = "{$articleTitle|spacify:'^^'}"
      output = 'I^^t^^ ^^w^^o^^r^^k^^s^^ ^^h^^o^^p^^e^^f^^u^^l^^l^^y'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: 'It works hopefully'})).toBe(output)
    })
  })
})
