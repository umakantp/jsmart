define(['jSmart'], function (jSmart) {
  describe('Test custom function:: cycle', function () {
    var tpl
    var output
    var t

    it('test simple cycle', function () {
      tpl = '{section name=rows loop=$data}'
      tpl += '<div class="{cycle values="odd,even"}"> {$data[rows]} </div>'
      tpl += '{/section}'
      output = '<div class="odd"> 1 </div>'
      output += '<div class="even"> 2 </div>'
      output += '<div class="odd"> 3 </div>'
      t = new jSmart(tpl)
      expect(t.fetch({data: [1, 2, 3]})).toBe(output)
    })

    it('test delimiter property cycle', function () {
      tpl = '{section name=rows loop=$data}'
      tpl += '<div class="{cycle values="odd:even" delimiter=":"}"> {$data[rows]} </div>'
      tpl += '{/section}'
      output = '<div class="odd"> 1 </div>'
      output += '<div class="even"> 2 </div>'
      output += '<div class="odd"> 3 </div>'
      t = new jSmart(tpl)
      expect(t.fetch({data: [1, 2, 3]})).toBe(output)
    })

    it('test assign property cycle', function () {
      tpl = '{section name=rows loop=$data}'
      tpl += '{cycle values="odd,even" assign="cls"}<div class="{$cls}"> {$data[rows]} </div>'
      tpl += '{/section}'
      output = '<div class="odd"> 1 </div>'
      output += '<div class="even"> 2 </div>'
      output += '<div class="odd"> 3 </div>'
      t = new jSmart(tpl)
      expect(t.fetch({data: [1, 2, 3]})).toBe(output)
    })

    it('test advance & print property cycle', function () {
      tpl = '{section name=rows loop=$data}'
      tpl += '<div class="{cycle values="odd,even" advance=true}"> {$data[rows]} </div>'
      tpl += '{cycle values="odd,even" advance=false print=false}'
      tpl += '{/section}'
      output = '<div class="odd"> 1 </div>'
      output += '<div class="even"> 2 </div>'
      output += '<div class="odd"> 3 </div>'
      t = new jSmart(tpl)
      expect(t.fetch({data: [1, 2, 3]})).toBe(output)
    })
  })
})
