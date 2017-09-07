define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: strip', function () {
    var tpl
    var output
    var t

    // Test for tabs and extra white space to be added.
    it('test simple strip', function () {
      // Simple
      tpl = '{strip}'
      tpl += 'all white spaces and\n'
      tpl += 'new lines shall be removed.\n'
      tpl += 'hope so'
      tpl += '{/strip}'
      output = 'all white spaces andnew lines shall be removed.hope so'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
