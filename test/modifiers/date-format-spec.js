define(['jSmart'], function (jSmart) {
  describe('Test modifier:: date_format', function () {
    var allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    it('test date_format', function () {
      var tpl
      var output
      var t
      var d = new Date()
      var month = allMonths[d.getMonth()]

      tpl = '{$smarty.now|date_format}'
      var da = d.getDate()
      if ((da + '').length < 2) {
        da = ' ' + da
      }
      output = month + ' ' + da + ', ' + d.getFullYear()

      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test date_format', function () {
      var tpl
      var output
      var t
      var d = new Date()

      tpl = '{$smarty.now|date_format:"%D"}'
      var m = d.getMonth()
      m++
      if ((m + '').length < 2) {
        m = '0' + m
      }
      var da = d.getDate()
      if ((da + '').length < 2) {
        da = '0' + da
      }
      output = m + '/' + da + '/' + ((d.getFullYear() + '').substr(2))

      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test date_format', function () {
      var tpl
      var output
      var t
      var d = new Date()

      tpl = '{$yesterday|date_format}'

      d.setTime(1473695667000)
      output = allMonths[(d.getMonth())] + ' ' + d.getDate() + ', ' + d.getFullYear()

      t = new jSmart(tpl)
      expect(t.fetch({yesterday: Math.floor((d.getTime() / 1000))})).toBe(output)
    })
  })
})
