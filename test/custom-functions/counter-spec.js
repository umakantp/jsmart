define(['jSmart'], function (jSmart) {
  describe('Test custom function:: counter', function () {
    var tpl
    var output
    var t

    it('test simple counter', function () {
      tpl = '{counter} and {counter} and {counter}'
      output = '1 and 2 and 3'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test named counter', function () {
      tpl = '{counter name=t} and {counter name=t} and {counter name=t}'
      output = '1 and 2 and 3'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test start and skip property of counter', function () {
      tpl = '{counter start=0 skip=2} and {counter} and {counter}'
      output = '0 and 2 and 4'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test direction property of counter', function () {
      tpl = '{counter start=0 skip=2 direction="down"} and {counter} and {counter}'
      output = '0 and -2 and -4'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test print property of counter', function () {
      tpl = '{counter start=10 print=false} {counter print=true}'
      output = ' 11'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test assign property of counter', function () {
      tpl = '{counter start=11 assign=test} {$test}'
      output = ' 11'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
