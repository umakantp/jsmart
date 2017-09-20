define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: capture', function () {
    var tpl
    var output
    var t

    it('test simple capture', function () {
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
      // with no name
      tpl = '{capture}'
      tpl += 'captured it for default'
      tpl += '{/capture}'
      tpl += '{$smarty.capture.default}'
      output = 'captured it for default'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test nested capture', function () {
      // with no name
      tpl = '{capture name="t2"}'
      tpl += 't2'
      tpl += '{capture name="t3"}'
      tpl += 't3 {/capture}'
      tpl += '{/capture}'
      tpl += '{$smarty.capture.t2} {$smarty.capture.t3}'
      output = 't2 t3 '
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
