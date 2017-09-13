define(['jSmart'], function (jSmart) {
  describe('Test modifier:: capitalize', function () {
    var tpl
    var output
    var t

    it('test capitalize', function () {
      tpl = '{$words|capitalize}'
      output = 'Next X-Men Film, x3, Delayed.'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'next x-men film, x3, delayed.'})).toBe(output)

      tpl = '{$words|capitalize:true}'
      output = 'Next X-Men Film, X3, Delayed.'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'next x-men film, x3, delayed.'})).toBe(output)
    })
  })
})
