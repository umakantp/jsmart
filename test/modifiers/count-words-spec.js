define(['jSmart'], function (jSmart) {
  describe('Test modifier:: count_words', function () {
    var tpl
    var output
    var t

    it('test count_words', function () {
      tpl = '{$words|count_words}'
      output = 11
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Hello World! And do you love it? If so tell us.'})).toBe(output)
    })

    it('test count_words with line breaks', function () {
      tpl = '{$words|count_words}'
      output = 13
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Hello World!\nempty sentence\nAnd do you love it?\nIf so tell us.'})).toBe(output)
    })
  })
})
