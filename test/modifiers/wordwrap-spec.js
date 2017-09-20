define(['jSmart'], function (jSmart) {
  describe('Test modifier:: wordwrap', function () {
    var tpl
    var output
    var t

    it('test wordwrap', function () {
      tpl = '{$words|wordwrap:30}'
      output = 'Blind woman gets new kidney\n'
      output += 'from dad she hasn\'t seen in\n'
      output += 'years.'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Blind woman gets new kidney from dad she hasn\'t seen in years.'})).toBe(output)

      tpl = '{$words|wordwrap:30:"<br />\\n"}'
      output = 'Blind woman gets new kidney<br />\n'
      output += 'from dad she hasn\'t seen in<br />\n'
      output += 'years.'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Blind woman gets new kidney from dad she hasn\'t seen in years.'})).toBe(output)

      tpl = '{$words|wordwrap:26:"<br />\\n":true}'
      output = 'Blind woman gets new kidn<br />\n'
      output += 'ey from dad she hasn\'t se<br />\n'
      output += 'en in years.'
      t = new jSmart(tpl)
      expect(t.fetch({words: 'Blind woman gets new kidney from dad she hasn\'t seen in years.'})).toBe(output)
    })
  })
})
