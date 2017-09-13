define(['jSmart'], function (jSmart) {
  describe('Test custom function:: html_image', function () {
    var tpl
    var output
    var t

    it('test simple html_image', function () {
      tpl = '{html_image file="pumpkin.jpg"}'
      output = '<img src="pumpkin.jpg" alt="" />'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test height/width/alt prop of html_image', function () {
      tpl = '{html_image file=$file height="5" width="5" alt="test image"}'
      output = '<img src="../test.png" alt="test image" width="5" height="5" />'
      t = new jSmart(tpl)
      expect(t.fetch({file: '../test.png'})).toBe(output)
    })

    it('test href prop of html_image', function () {
      tpl = '{html_image file=$file height="5" width="5" alt="test image" href="http://umakantpatil.com"}'
      output = '<a href="http://umakantpatil.com"><img src="../test.png" alt="test image" width="5" height="5" /></a>'
      t = new jSmart(tpl)
      expect(t.fetch({file: '../test.png'})).toBe(output)
    })
  })
})
