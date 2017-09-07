define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: function', function () {
    var tpl
    var output
    var t

    it('test simple function', function () {
      // Simple
      tpl = '{function name=simple}'
      tpl += 'it is a simple function'
      tpl += '{/function}'
      tpl += '{simple}'
      output = 'it is a simple function'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test function with data', function () {
      tpl = '{function name=simple}'
      tpl += 'it is a {$data} function'
      tpl += '{/function}'
      tpl += '{simple data="data"}'
      output = 'it is a data function'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test function with default data', function () {
      tpl = '{function name=simple data="default"}'
      tpl += 'it is a {$data} function'
      tpl += '{/function}'
      tpl += '{simple}'
      tpl += '{simple data="data"}'
      output = 'it is a default function'
      output += 'it is a data function'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test recursive function', function () {
      tpl = "{function name='menu' level=0}"
      tpl += 'current level is {$level}.'
      tpl += '{if $level === 0} {menu level=2} {/if}'
      tpl += '{/function}'
      tpl += '{menu}'
      output = 'current level is 0.'
      output += ' current level is 2. '
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test function shorthand', function () {
      tpl = '{function simple}'
      tpl += 'it is a {$data} function'
      tpl += '{/function}'
      tpl += '{simple data="data"}'
      output = 'it is a data function'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
