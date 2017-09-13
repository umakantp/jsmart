define(['jSmart'], function (jSmart) {
  describe('Test modifier:: lower', function () {
    var tpl
    var output
    var t

    it('test lower', function () {
      tpl = '{$words|lower}'
      output = 'next x-men film, x3, delayed.'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Next X-Men Film, x3, Delayed.'})).toBe(output)

      tpl = '{$words|lower}'
      output = 'next x-men film, x3, delayed.'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'next x-men film, x3, delayed.'})).toBe(output)
    })
  })
})
