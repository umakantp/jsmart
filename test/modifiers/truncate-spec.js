define(['jSmart'], function (jSmart) {
  describe('Test modifier:: truncate', function () {
    var tpl
    var output
    var t

    it('test truncate', function () {
      tpl = '{$text|truncate}'
      output = 'Two Sisters Reunite after Eighteen Years at Checkout Counter.'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Two Sisters Reunite after Eighteen Years at Checkout Counter.'})).toBe(output)
    })

    it('test truncate', function () {
      tpl = '{$text|truncate:30}'
      output = 'Two Sisters Reunite after...'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Two Sisters Reunite after Eighteen Years at Checkout Counter.'})).toBe(output)
    })

    it('test truncate', function () {
      tpl = '{$text|truncate:30:""}'
      output = 'Two Sisters Reunite after'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Two Sisters Reunite after Eighteen Years at Checkout Counter.'})).toBe(output)
    })

    it('test truncate', function () {
      tpl = '{$text|truncate:30:"---"}'
      output = 'Two Sisters Reunite after---'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Two Sisters Reunite after Eighteen Years at Checkout Counter.'})).toBe(output)
    })

    it('test truncate', function () {
      tpl = '{$text|truncate:30:"":true}'
      output = 'Two Sisters Reunite after Eigh'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Two Sisters Reunite after Eighteen Years at Checkout Counter.'})).toBe(output)
    })

    it('test truncate', function () {
      tpl = '{$text|truncate:30:"...":true}'
      output = 'Two Sisters Reunite after E...'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Two Sisters Reunite after Eighteen Years at Checkout Counter.'})).toBe(output)
    })

    it('test truncate', function () {
      tpl = '{$text|truncate:30:"..":true:true}'
      output = 'Two Sisters Re..ckout Counter.'
      t = new jSmart(tpl)
      expect(t.fetch({text: 'Two Sisters Reunite after Eighteen Years at Checkout Counter.'})).toBe(output)
    })
  })
})
