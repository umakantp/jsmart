define(['jSmart'], function (jSmart) {
  describe('Test modifier:: cat', function () {
    var tpl
    var output
    var t

    it('test cat', function () {
      tpl = '{$words|cat: " world"}'
      output = 'Hello world'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Hello'})).toBe(output)
    })
  })
})
