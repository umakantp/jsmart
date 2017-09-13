define(['jSmart'], function (jSmart) {
  describe('Test custom function:: html_options', function () {
    var tpl
    var output
    var t

    it('test simple html_options', function () {
      tpl = '{html_options name="id" values=$ids output=$names}'
      output = '<select name="id">\n<option value="1000">Arnavi</option>\n'
      output += '<option value="2000">Tanishka</option>\n'
      output += '<option value="3000">Swastika</option>\n</select>\n'
      t = new jSmart(tpl)
      expect(t.fetch({
        ids: [1000, 2000, 3000],
        names: ['Arnavi', 'Tanishka', 'Swastika']
      })).toBe(output)
    })

    it('test options property html_options', function () {
      tpl = '{html_options name="id" options=$list}'
      output = '<select name="id">\n<option value="1000">Arnavi</option>\n'
      output += '<option value="2000">Tanishka</option>\n'
      output += '<option value="3000">Swastika</option>\n</select>\n'
      t = new jSmart(tpl)
      expect(t.fetch({
        list: {1000: 'Arnavi', 2000: 'Tanishka', 3000: 'Swastika'}
      })).toBe(output)
    })

    it('test selected property html_options', function () {
      tpl = '{html_options name="id" options=$list selected=$selected}'
      output = '<select name="id">\n<option value="1000">Arnavi</option>\n'
      output += '<option value="2000" selected="selected">Tanishka</option>\n'
      output += '<option value="3000">Swastika</option>\n</select>\n'
      t = new jSmart(tpl)
      expect(t.fetch({
        list: {1000: 'Arnavi', 2000: 'Tanishka', 3000: 'Swastika'},
        selected: 2000
      })).toBe(output)
    })

    it('test without name property html_options', function () {
      tpl = '{html_options options=$list selected=$selected}'
      output = '<option value="1000" selected="selected">Arnavi</option>\n'
      output += '<option value="2000" selected="selected">Tanishka</option>\n'
      output += '<option value="3000">Swastika</option>\n'
      t = new jSmart(tpl)
      expect(t.fetch({
        list: {1000: 'Arnavi', 2000: 'Tanishka', 3000: 'Swastika'},
        selected: [1000, 2000]
      })).toBe(output)
    })
  })
})
