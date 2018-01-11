define(['jSmart'], function (jSmart) {
  describe('Test modifier:: count', function () {
    var tpl
    var output
    var t

    it('test count', function () {
      tpl = '{$data|count}'
      output = 3
      t = new jSmart(tpl)
      expect(t.fetch({data: [0, 1, 2]})).toBe(output)
    })

    it('test count empty', function () {
      tpl = '{$data|count}'
      output = 0
      t = new jSmart(tpl)
      expect(t.fetch({data: []})).toBe(output)
    })

    it('test count object', function () {
      tpl = '{$data|count}'
      output = 3
      t = new jSmart(tpl)
      expect(t.fetch({data: {x: 1, y: 2, z: 3}})).toBe(output)
    })

    it('test count empty object', function () {
      tpl = '{$data|count}'
      output = 0
      t = new jSmart(tpl)
      expect(t.fetch({data: {}})).toBe(output)
    })
  })
})
