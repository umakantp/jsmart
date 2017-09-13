define(['jSmart'], function (jSmart) {
  describe('Test custom function:: html_table', function () {
    var tpl
    var output
    var t

    it('test simple html_table', function () {
      tpl = '{html_table loop=$data}'
      output = '<table border="1">\n<tbody>\n'
      output += '<tr><td>1</td><td>2</td><td>3</td></tr>\n'
      output += '<tr><td>4</td><td>5</td><td>6</td></tr>\n'
      output += '<tr><td>7</td><td>8</td><td>9</td></tr>\n'
      output += '</tbody>\n</table>\n'
      t = new jSmart(tpl)
      expect(t.fetch({
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      })).toBe(output)
    })
  })
})
