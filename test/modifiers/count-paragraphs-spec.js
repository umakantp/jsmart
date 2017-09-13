define(['jSmart'], function (jSmart) {
  describe('Test modifier:: count_paragraphs', function () {
    var tpl
    var output
    var t

    it('test count_paragraphs', function () {
      tpl = '{$words|count_paragraphs}'
      output = 2
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Hello World \nwhat'})).toBe(output)
    })

    it('test count_paragraphs with more space', function () {
      tpl = '{$words|count_paragraphs}'
      output = 2
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Hello World\n\nwhat'})).toBe(output)
    })
  })
})
