define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: nocache', function () {
    var tpl
    var output
    var t

    // We do not support nocache as of now, lets make sure it doesn't
    // break anything.
    it('test simple nocache', function () {
      // Simple
      tpl = '{nocache} test {/nocache}'
      output = ' test '
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
