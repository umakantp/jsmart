define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: block', function () {
    var output
    var t
    var parent
    var child

    it('test standalone (as is) block', function () {
      parent = '<b>'
      parent += 'wow '
      parent += '{block name="t"}Default title{/block}'
      parent += '</b>'

      output = '<b>wow Default title</b>'
      t = new jSmart(parent)
      expect(t.fetch()).toBe(output)
    })

    it('test simple block', function () {
      parent = '<b>'
      parent += 'wow '
      parent += '{block name="t"}Default title{/block}'
      parent += '</b>'

      child = "{extends file='parent'}"
      child += '{block name="t"}'
      child += 'New title'
      child += '{/block}'

      jSmart.prototype.getTemplate = function () {
        return parent
      }

      output = '<b>wow New title</b>'
      t = new jSmart(child)
      expect(t.fetch()).toBe(output)
    })

    it('test prepend block', function () {
      parent = '<b>'
      parent += 'wow '
      parent += '{block name="t"}title is {/block}'
      parent += '</b>'

      child = "{extends file='parent'}"
      child += '{block name="t" prepend}'
      child += 'complete'
      child += '{/block}  see if it ignores this.. should be'

      jSmart.prototype.getTemplate = function () {
        return parent
      }

      output = '<b>wow title is complete</b>'
      t = new jSmart(child)
      expect(t.fetch()).toBe(output)
    })

    it('test append block', function () {
      parent = '<b>'
      parent += 'wow '
      parent += '{block name="t"}is title{/block}'
      parent += '</b>'

      child = "{extends file='parent'}"
      child += '{block name="t" append}'
      child += 'yo '
      child += '{/block}  see if it ignores this.. should be'

      jSmart.prototype.getTemplate = function () {
        return parent
      }

      output = '<b>wow yo is title</b>'
      t = new jSmart(child)
      expect(t.fetch()).toBe(output)
    })

    it('test child block', function () {
      parent = '<b>'
      parent += 'wow '
      parent += '{block name="t"} ** {$smarty.block.child} ** {/block}'
      parent += '</b>'

      child = "ignore this {extends file='parent'}"
      child += '{block name="t"}'
      child += 'new title'
      child += '{/block}  see if it ignores this.. should be'

      jSmart.prototype.getTemplate = function () {
        return parent
      }

      output = '<b>wow  ** new title ** </b>'
      t = new jSmart(child)
      expect(t.fetch()).toBe(output)
    })

    it('test parent block', function () {
      parent = '<b>'
      parent += 'wow '
      parent += '{block name="t"} Default title {/block}'
      parent += '</b>'

      child = "ignore this {extends file='parent'}"
      child += '{block name="t"}'
      child += '** {$smarty.block.parent} **'
      child += '{/block}  see if it ignores this.. should be'

      jSmart.prototype.getTemplate = function () {
        return parent
      }

      output = '<b>wow **  Default title  **</b>'
      t = new jSmart(child)
      expect(t.fetch()).toBe(output)
    })

    jSmart.prototype.getTemplate = null
  })
})
