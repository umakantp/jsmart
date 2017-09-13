define(['jSmart'], function (jSmart) {
  describe('Test modifier:: strip_tags', function () {
    var tpl
    var output
    var t

    it('test strip_tags', function () {
      tpl = '{$text|strip_tags}'
      output = 'Blind Woman Gets  New Kidney  from Dad she Hasn\'t Seen in  years .'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Blind Woman Gets <font face="helvetica">New Kidney</font> from Dad she Hasn\'t Seen in <b>years</b>.'})).toBe(output)
    })

    it('test strip_tags', function () {
      tpl = '{$text|strip_tags:false}'
      output = 'Blind Woman Gets New Kidney from Dad she Hasn\'t Seen in years.'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Blind Woman Gets <font face="helvetica">New Kidney</font> from Dad she Hasn\'t Seen in <b>years</b>.'})).toBe(output)
    })
  })
})
