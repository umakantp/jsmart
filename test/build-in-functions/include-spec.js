define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: include', function () {
    var tpl
    var output
    var t

    it('test simple include', function () {
      jSmart.prototype.getTemplate = function (name) {
        if (name === 'child.tpl') {
          return 'child'
        }
      }
      tpl = 'parent:'
      tpl += '{include file="child.tpl"}'

      output = 'parent:child'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test include with data', function () {
      jSmart.prototype.getTemplate = function (name) {
        if (name === 'child2.tpl') {
          return 'child{$p}-{$t}'
        }
      }
      tpl = 'parent{$p}:'
      tpl += '{include file="child2.tpl" p="po" t=$p}'

      output = 'parentyo:childpo-yo'
      t = new jSmart(tpl)
      expect(t.fetch({p: 'yo'})).toBe(output)
    })

    it('test include cache', function () {
      // Old child.tpl had 'child' text. in test 1
      // Now we modified child.tpl. But new value won't be fetched
      // as old is cached and we wont use nocache.
      jSmart.prototype.getTemplate = function (name) {
        if (name === 'child.tpl') {
          return 'new child'
        }
      }
      tpl = 'parent:'
      tpl += '{include "child.tpl"}'
      // Output should come from old value.
      output = 'parent:child'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test include nocache', function () {
      // Old child.tpl had 'child' text. in test 1
      // Now we modified child.tpl. But new value will be fetched
      // as we will use now nocache.
      jSmart.prototype.getTemplate = function (name) {
        if (name === 'child.tpl') {
          return 'new child'
        }
      }
      tpl = 'parent:'
      tpl += '{include "child.tpl" nocache}'
      // Output should come from old value.
      output = 'parent:new child'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
