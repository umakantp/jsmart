// eslint-disable-next-line no-unused-vars
const my = function (x) {
  return 'my'
}

// eslint-disable-next-line no-unused-vars
const myEnv = function (val) {
  if (val) {
    return 'my'
  }
  return 'your'
}

define(['jSmart'], function (jSmart) {
  describe('Test env(php/js) function :: simple-func', function () {
    var tpl
    var output
    var t

    // Test if simple global functions are accessible.
    it('test simple func', function () {
      // Simple
      tpl = 'hello-{my()}-world'
      output = 'hello-my-world'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    // Test if global functions with args are accessible.
    it('test env(php/js) function :: func-with-args', function () {
      // Simple
      tpl = 'hello-{myEnv($val)}-world'
      var output1 = 'hello-my-world'
      var output2 = 'hello-your-world'
      t = new jSmart(tpl)
      expect(t.fetch({val: true})).toBe(output1)
      expect(t.fetch({val: false})).toBe(output2)
    })
  })
})
