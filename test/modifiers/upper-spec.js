define(['jSmart'], function (jSmart) {
  describe('Test modifier:: upper', function () {
    var tpl
    var output
    var t

    it('test upper', function () {
      tpl = '{$words|upper}'
      output = 'NEXT X-MEN FILM, X3, DELAYED.'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'next x-men FilM, x3, delayed.'})).toBe(output)

      tpl = '{$words|upper}'
      output = 'NEXT X-MEN FILM, X3, DELAYED.'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'NEXT X-MEN FILM, X3, DELAYED.'})).toBe(output)
    })
  })
})
