define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: capture', function () {
    it('test simple capture', function () {
      var tpl
      var output
      var t

      // Simple
      tpl = "{capture name='simple'}"
      tpl += 'captured it'
      tpl += '{/capture}'
      tpl += '{$smarty.capture.simple}'
      output = 'captured it'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      // Simple short hand
      tpl = "{capture 'withData'}"
      tpl += 'yo, my name is {$myName}.'
      tpl += '{/capture}'
      tpl += '{$smarty.capture.withData}'
      output = 'yo, my name is Pallavi.'
      t = new jSmart(tpl)
      expect(t.fetch({myName: 'Pallavi'})).toBe(output)
    })

    it('test assigned capture', function () {
      var tpl
      var output
      var t

      // Assigned
      tpl = "{capture name='simple' assign='simple'}"
      tpl += 'captured it'
      tpl += '{/capture}'
      tpl += '{$simple}'
      output = 'captured it'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test default capture', function () {
      var tpl
      var output
      var t

      // with no name
      tpl = '{capture}'
      tpl += 'captured it for default'
      tpl += '{/capture}'
      tpl += '{$smarty.capture.default}'
      output = 'captured it for default'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    // it('test nested capture', function () {
    // It currently breaks. TODO::.
    // })
  })
})
