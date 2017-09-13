define(['jSmart'], function (jSmart) {
  describe('Test custom function:: html_select_date', function () {
    var tpl
    var output
    var t
    var months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    var d = new Date()
    var selected
    var i

    it('test simple html_select_date', function () {
      tpl = '{html_select_date}'
      output = '<select name="Date_Month">\n'
      for (i = 1; i < months.length; ++i) {
        selected = (i === (d.getMonth() + 1)) ? ' selected="selected"' : ''
        output += '<option value="' + i + '"' + selected + '>' + months[i] + '</option>\n'
      }
      output += '</select>\n'
      output += '<select name="Date_Day">\n'
      for (i = 1; i <= 31; ++i) {
        selected = (i === d.getDate()) ? ' selected="selected"' : ''
        output += '<option value="' + i + '"' + selected + '>' + i + '</option>\n'
      }
      output += '</select>\n'
      output += '<select name="Date_Year">\n'
      output += '<option value="' + d.getFullYear() + '" selected="selected">' + d.getFullYear() + '</option>\n'
      output += '</select>\n'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test *_year prop html_select_date', function () {
      tpl = '{html_select_date start_year="2013" end_year="2020"}'
      output = '<select name="Date_Month">\n'
      for (var i = 1; i < months.length; ++i) {
        selected = (i === (d.getMonth() + 1)) ? ' selected="selected"' : ''
        output += '<option value="' + i + '"' + selected + '>' + months[i] + '</option>\n'
      }
      output += '</select>\n'
      output += '<select name="Date_Day">\n'
      for (i = 1; i <= 31; ++i) {
        selected = (i === d.getDate()) ? ' selected="selected"' : ''
        output += '<option value="' + i + '"' + selected + '>' + i + '</option>\n'
      }
      output += '</select>\n'
      output += '<select name="Date_Year">\n'
      for (i = 2013; i <= 2020; ++i) {
        selected = (i === d.getFullYear()) ? ' selected="selected"' : ''
        output += '<option value="' + i + '"' + selected + '>' + i + '</option>\n'
      }
      output += '</select>\n'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
