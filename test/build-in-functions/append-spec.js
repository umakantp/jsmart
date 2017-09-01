define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: append', function () {
    it('test simple append', function () {
      var tpl
      var output
      var t

      // Single value
      tpl = "{append var='arr' value='a'}"
      tpl += 'Value of var arr is {$arr}.'
      output = 'Value of var arr is a.'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      // Single value short hand
      tpl = "{append 'name' 'John'}"
      tpl += 'My name is {$name}.'
      output = 'My name is John.'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test array append', function () {
      var tpl
      var output
      var t

      // Array
      tpl = "{append var='name' value='Bob' index='first'}"
      tpl += 'The first name is {$name.first}.'
      output = 'The first name is Bob.'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      // Array short hand.
      tpl = "{append 'name' 'Bob' index='first'}"
      tpl += 'The first name is {$name.first}.'
      output = 'The first name is Bob.'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      // Array
      tpl = "{append var='arr' value='a'}"
      tpl += "{append var='arr' value='b'}"
      tpl += 'Value of var is {$arr[1]}.'
      output = 'Value of var is b.'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
