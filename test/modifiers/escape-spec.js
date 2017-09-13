define(['jSmart'], function (jSmart) {
  describe('Test modifier:: escape', function () {
    var tpl
    var output
    var t

    it('test escape', function () {
      tpl = '{$articleTitle|escape}'
      output = '&#039;Stiff Opposition &lt;b&gt;Expected&lt;/b&gt; to Casketless Funeral Plan&#039;'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: "'Stiff Opposition <b>Expected</b> to Casketless Funeral Plan'"})).toBe(output)

      tpl = "{$articleTitle|escape:'html'}"
      output = '&#039;Stiff Opposition &lt;b&gt;Expected&lt;/b&gt; to Casketless Funeral Plan&#039;'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: "'Stiff Opposition <b>Expected</b> to Casketless Funeral Plan'"})).toBe(output)

      tpl = "{$articleTitle|escape:'htmlall'}"
      output = '&#39;Stiff Opposition &lt;b&gt;Expected&lt;/b&gt; to Casketless Funeral Plan&#39;'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: "'Stiff Opposition <b>Expected</b> to Casketless Funeral Plan'"})).toBe(output)

      tpl = "{$articleTitle|escape:'url'}"
      output = '%27Stiff%20Opposition%20Expected%20to%20Casketless%20Funeral%20Plan%27'
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: "'Stiff Opposition Expected to Casketless Funeral Plan'"})).toBe(output)

      tpl = "{$articleTitle|escape:'quotes'}"
      output = "\\'Stiff Opposition <b>Expected</b> to Casketless Funeral Plan\\'"
      t = new jSmart(tpl)
      expect(t.fetch({articleTitle: "'Stiff Opposition <b>Expected</b> to Casketless Funeral Plan'"})).toBe(output)

      tpl = "{'mail@example.com'|escape:'mail'}"
      output = 'mail [AT] example [DOT] com'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })
  })
})
