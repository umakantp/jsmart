define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: literal', function () {
    var tpl
    var output
    var t

    it('test simple literal', function () {
      // Simple
      tpl = '{literal} <script> function x () { var y; } function c() {alert(1)}</script> {/literal}'
      output = ' <script> function x () { var y; } function c() {alert(1)}</script> '
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test custom delimiter literal', function () {
      tpl = '{{literal}} <script> function x () { var y; }</script> {{/literal}}'
      output = ' <script> function x () { var y; }</script> '
      t = new jSmart(tpl, {ldelim: '{{', rdelim: '}}'})
      expect(t.fetch()).toBe(output)
    })
  })
})
