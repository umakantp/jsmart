define(['jSmart'], function (jSmart) {
  describe('Test custom function:: textformat', function () {
    var tpl
    var output
    var t

    it('test textformat', function () {
      tpl = '{textformat wrap=20}'
      tpl += ' This is foo.'
      tpl += ' This is foo.'
      tpl += ' This is      foo.'
      tpl += ''
      tpl += ''
      tpl += ' This is foo.'
      tpl += ' This is foo.'
      tpl += '{/textformat}'

      output = 'This is foo. This is\n'
      output += 'foo. This is foo.\n'
      output += 'This is foo. This is\n'
      output += 'foo.'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
