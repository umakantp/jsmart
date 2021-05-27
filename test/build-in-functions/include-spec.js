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

    it('test include cache/nocache', function () {
      jSmart.prototype.getTemplate = function (name) {
        if (name === 'child3.tpl') {
          return 'child'
        }
      }
      tpl = 'parent:'
      tpl += '{include "child3.tpl"}'
      t = new jSmart(tpl)
      output = 'parent:child'
      expect(t.fetch()).toBe(output)

      // Old child3.tpl had 'child' text. in test 1
      // Now we modified child.tpl. But new value won't be fetched
      // as old is cached and we wont use nocache.
      jSmart.prototype.getTemplate = function (name) {
        if (name === 'child3.tpl') {
          return 'new child'
        }
      }
      tpl = 'parent:'
      tpl += '{include "child3.tpl"}'
      // Output should come from old value.
      output = 'parent:child'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)

      // Old child3.tpl had 'child' text. in test 1
      // Now we modified child.tpl. But new value will be fetched
      // as we will use now nocache.
      jSmart.prototype.getTemplate = function (name) {
        if (name === 'child3.tpl') {
          return 'new child'
        }
      }
      tpl = 'parent:'
      tpl += '{include "child3.tpl" nocache}'
      // Output should come from old value.
      output = 'parent:new child'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test include inside include', function () {
      jSmart.prototype.getTemplate = function (name) {
        if (name === 'rchild.tpl') {
          return 'include1-{include file="rchild2.tpl"}-include1'
        }
        if (name === 'rchild2.tpl') {
          return 'deep-include'
        }
      }

      tpl = 'main-{include file="rchild.tpl"}-main'

      output = 'main-include1-deep-include-include1-main'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
