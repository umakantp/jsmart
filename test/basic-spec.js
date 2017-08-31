define(['jSmart', 'text!./templates/var.tpl', 'text!./output/var.tpl'], function (jSmart, smartyTpl, outputTpl) {
  jSmart.prototype.registerPlugin(
    'function',
    'sayHello',
    function (params, data) {
      var s = 'Hello '
      s += params.to
      return s
    }
  )

  describe('Test Syntax', function () {
    it('test plain text', function () {
      var t = new jSmart('Hello world')
      expect(t.fetch()).toBe('Hello world')
    })

    it('test variable', function () {
      var t = new jSmart('Hello {$name}, how are you?')
      expect(t.fetch({name: 'world'})).toBe('Hello world, how are you?')
    })

    it('test array/object variable', function () {
      // Objects.
      var t = new jSmart('1. Hello {$user.name.first}, how are you?')
      expect(t.fetch({user: {name: {first: 'Uma'}}})).toBe('1. Hello Uma, how are you?')

      // Arrays.
      t = new jSmart("2. Hello {$user['name']['first']}, how are you?")
      expect(t.fetch({user: {name: {first: 'Uma'}}})).toBe('2. Hello Uma, how are you?')

      // Objects.
      t = new jSmart('3. Hello {$user->name->first}, how are you?')
      expect(t.fetch({user: {name: {first: 'Uma'}}})).toBe('3. Hello Uma, how are you?')
    })

    it('test comment', function () {
      var t = new jSmart('Testing {*comments yo *}, does it work?')
      expect(t.fetch()).toBe('Testing , does it work?')
    })

    it('test assigning variable', function () {
      var t = new jSmart("{$foo = 'bar'} print foo {$foo}")
      expect(t.fetch()).toBe(' print foo bar')
    })

    it('test double quotes strings', function () {
      var t = new jSmart('{$foo="bar"} {$bar = "value of foo is \'$foo\'"} {$bar}')
      expect(t.fetch()).toBe("  value of foo is 'bar'")

      // back tick test.
      t = new jSmart('{$foo = "`$person.name.first` has `$person[\'favorite gadget\']`"} {$foo}')
      expect(t.fetch({person: {name: {first: 'Umakant'}, 'favorite gadget': 'ipad'}})).toBe(' Umakant has ipad')
    })

    it('test complex template', function () {
      // Insert complex statements in the template and test them.
      var t = new jSmart(smartyTpl)
      expect(t.fetch(getData())).toBe(outputTpl)
    })
  })
})
