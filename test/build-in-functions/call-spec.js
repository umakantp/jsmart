define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: call', function () {
    it('test simple call', function () {
      var tpl
      var output
      var t

      // Simple
      tpl = "{function name='simple'}"
      tpl += 'function outputs this'
      tpl += '{/function}'
      tpl += "{call name='simple'}"
      output = 'function outputs this'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      // Simple short hand
      tpl = "{function name='withData'}"
      tpl += 'yo, my name is {$myName}.'
      tpl += '{/function}'
      tpl += "{call 'withData' myName=$myName}"
      output = 'yo, my name is Pallavi.'
      t = new jSmart(tpl)
      expect(t.fetch({myName: 'Pallavi'})).toBe(output)
    })

    it('test recursive call', function () {
      var tpl
      var output
      var t

      // Rescursive
      tpl = "{function name='menu' level=0}"
      tpl += 'Current level is: {$level}\\n'
      tpl += '{if $level == 0} {call name=menu level=2} {/if}'
      tpl += '{/function}'
      tpl += "{call name='menu'}"
      output = 'Current level is: 0\\n Current level is: 2\\n '
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
