define(['jSmart'], function (jSmart) {
  describe('Test custom function:: fetch', function () {
    var tpl
    var output
    var t

    it('test simple fetch', function () {
      jSmart.prototype.getFile = function (name) {
        if (name === 'http://umakantpatil.com') {
          return 'Its my home page.'
        }
      }
      tpl = '{fetch file="http://umakantpatil.com"}'
      output = 'Its my home page.'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test assign property fetch', function () {
      jSmart.prototype.getFile = function (name) {
        if (name === 'http://umakantpatil.com') {
          return 'Its my home page.'
        }
      }
      tpl = '{fetch assign="val" file="http://umakantpatil.com"} {$val}'
      output = ' Its my home page.'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
