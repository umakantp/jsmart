define(['jSmart'], function (jSmart) {
  describe('Test modifier:: strip', function () {
    var tpl
    var output
    var t

    it('test strip', function () {
      tpl = '{$text|strip}'
      output = 'Grandmother of eight makes hole in one.'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Grandmother of\neight makes\t    hole in one.'})).toBe(output)
    })

    it('test strip', function () {
      tpl = '{$text|strip:"&nbsp;"}'
      output = 'Grandmother&nbsp;of&nbsp;eight&nbsp;makes&nbsp;hole&nbsp;in&nbsp;one.'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Grandmother of\neight makes\t    hole in one.'})).toBe(output)
    })
  })
})
