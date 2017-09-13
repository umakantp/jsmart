define(['jSmart'], function (jSmart) {
  describe('Test custom function:: html_radios', function () {
    var tpl
    var output
    var t

    it('test simple html_radios', function () {
      tpl = '{html_radios name="id" values=$ids output=$names}'
      output = '<label><input type="radio" name="id" value="1000" />Arnavi</label>\n'
      output += '<label><input type="radio" name="id" value="2000" />Tanishka</label>\n'
      output += '<label><input type="radio" name="id" value="3000" />Swastika</label>'
      t = new jSmart(tpl)
      expect(t.fetch({
        ids: [1000, 2000, 3000],
        names: ['Arnavi', 'Tanishka', 'Swastika']
      })).toBe(output)
    })

    it('test options/separator property html_radios', function () {
      tpl = '{html_radios name="id" options=$list separator="<br>"}'
      output = '<label><input type="radio" name="id" value="1000" />Arnavi</label><br>\n'
      output += '<label><input type="radio" name="id" value="2000" />Tanishka</label><br>\n'
      output += '<label><input type="radio" name="id" value="3000" />Swastika</label><br>'
      t = new jSmart(tpl)
      expect(t.fetch({
        list: {1000: 'Arnavi', 2000: 'Tanishka', 3000: 'Swastika'}
      })).toBe(output)
    })

    it('test selected/labels property html_radios', function () {
      tpl = '{html_radios name="id" options=$list separator="<br>" selected=$selected labels=false}'
      output = '<input type="radio" name="id" value="1000" />Arnavi<br>\n'
      output += '<input type="radio" name="id" value="2000" checked="checked" />Tanishka<br>\n'
      output += '<input type="radio" name="id" value="3000" />Swastika<br>'
      t = new jSmart(tpl)
      expect(t.fetch({
        list: {1000: 'Arnavi', 2000: 'Tanishka', 3000: 'Swastika'},
        selected: 2000
      })).toBe(output)
    })
  })
})
